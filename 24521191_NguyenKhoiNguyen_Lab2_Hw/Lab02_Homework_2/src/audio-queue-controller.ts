
import type {
  AudioTask,
  AudioTaskInput,
  AudioTaskHandle,
  AudioTaskProcessor,
  AudioQueueSnapshot,
  QueueListener,
} from "./audio-types";

import {
  AudioTaskCancelledError,
} from "./audio-types";

interface InternalTask<TResult> {
  task: AudioTask;
  controller: AbortController;
  resolve: (value: TResult) => void;
  reject: (reason: unknown) => void;
  settled: boolean;
}

export class AudioTaskQueue<TResult> {
  private pending: InternalTask<TResult>[] = [];
  private active: InternalTask<TResult> | null = null;
  private history: AudioTask[] = [];
  private listeners = new Set<QueueListener>();
  private isProcessing = false;
  private disposed = false;
  private readonly processor: AudioTaskProcessor<TResult>;

  constructor(processor: AudioTaskProcessor<TResult>) {
    this.processor = processor;
  }

  // Return a copy so consumers cannot mutate queue state.
  getSnapshot(): AudioQueueSnapshot {
    return {
      tasks: this.history.map((task) => ({ ...task })),
      activeTaskId: this.active?.task.id ?? null,
      pendingCount: this.pending.length,
      isProcessing: this.isProcessing,
    };
  }

  subscribe(listener: QueueListener): () => void {
    if (this.disposed) {
      throw new Error("Audio queue has been disposed");
    }

    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  enqueue(input: AudioTaskInput): AudioTaskHandle<TResult> {
    if (this.disposed) {
      throw new Error("Cannot enqueue into a disposed queue");
    }

    if (!input.trackUrl.trim()) {
      throw new Error("Track URL must not be empty");
    }

    const id = crypto.randomUUID();
    const controller = new AbortController();

    const task: AudioTask = {
      id,
      trackUrl: input.trackUrl,
      title: input.title.trim() || "Untitled Track",
      status: "queued",
      enqueuedAt: Date.now(),
    };

    let resolveTask!: (value: TResult) => void;
    let rejectTask!: (reason: unknown) => void;

    const result = new Promise<TResult>((resolve, reject) => {
      resolveTask = resolve;
      rejectTask = reject;
    });

    const internalTask: InternalTask<TResult> = {
      task,
      controller,
      resolve: resolveTask,
      reject: rejectTask,
      settled: false,
    };

    this.pending.push(internalTask);
    this.history.push(task);

    this.notify();

    // Start the worker without creating duplicate processors.
    void this.processNext();

    return {
      id,
      result,
      cancel: () => this.cancel(id),
    };
  }

  cancel(id: string): boolean {
    // Handle a pending task.
    const pendingIndex = this.pending.findIndex(
      (entry) => entry.task.id === id
    );

    if (pendingIndex !== -1) {
      const [entry] = this.pending.splice(pendingIndex, 1);

      entry.controller.abort();
      entry.task.status = "cancelled";

      this.settleReject(
        entry,
        new AudioTaskCancelledError()
      );

      this.notify();
      return true;
    }

    // Handle an active task.
    if (
      this.active &&
      this.active.task.id === id &&
      !this.active.controller.signal.aborted
    ) {
      this.active.controller.abort();
      this.active.task.status = "cancelled";

      this.settleReject(
        this.active,
        new AudioTaskCancelledError()
      );

      this.notify();
      return true;
    }

    return false;
  }

  cancelAll(): void {
    const ids = [
      ...this.pending.map((entry) => entry.task.id),
      ...(this.active ? [this.active.task.id] : []),
    ];

    for (const id of ids) {
      this.cancel(id);
    }
  }

  dispose(): void {
    if (this.disposed) return;

    this.cancelAll();
    this.disposed = true;
    this.listeners.clear();
  }

  private settleResolve(
    entry: InternalTask<TResult>,
    value: TResult
  ): void {
    if (entry.settled) return;

    entry.settled = true;
    entry.resolve(value);
  }

  private settleReject(
    entry: InternalTask<TResult>,
    reason: unknown
  ): void {
    if (entry.settled) return;

    entry.settled = true;
    entry.reject(reason);
  }

  private notify(): void {
    if (this.disposed) return;

    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.disposed) {
      return;
    }

    this.isProcessing = true;
    this.notify();

    try {
      while (
        this.pending.length > 0 &&
        !this.disposed
      ) {
        const entry = this.pending.shift()!;

        if (entry.controller.signal.aborted) {
          continue;
        }

        this.active = entry;
        entry.task.status = "processing";

        this.notify();

        try {
          const output = await this.processor(
            entry.task.trackUrl,
            entry.controller.signal
          );

          // Ignore any late result after cancellation.
          if (entry.controller.signal.aborted) {
            entry.task.status = "cancelled";

            this.settleReject(
              entry,
              new AudioTaskCancelledError()
            );
          } else {
            entry.task.status = "completed";
            this.settleResolve(entry, output);
          }
        } catch (error) {
          if (entry.controller.signal.aborted) {
            entry.task.status = "cancelled";

            this.settleReject(
              entry,
              new AudioTaskCancelledError()
            );
          } else {
            entry.task.status = "failed";
            this.settleReject(entry, error);
          }
        } finally {
          this.active = null;
          this.notify();
        }
      }
    } finally {
      this.isProcessing = false;
      this.notify();
    }
  }
}
