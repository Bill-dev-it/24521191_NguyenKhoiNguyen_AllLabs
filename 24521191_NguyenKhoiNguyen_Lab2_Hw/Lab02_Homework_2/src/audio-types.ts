
export type AudioTaskStatus =
  | "queued"
  | "processing"
  | "completed"
  | "cancelled"
  | "failed";

export interface AudioTask {
  id: string;
  trackUrl: string;
  title: string;
  status: AudioTaskStatus;
  enqueuedAt: number;
}

export interface AudioQueueSnapshot {
  tasks: AudioTask[];
  activeTaskId: string | null;
  pendingCount: number;
  isProcessing: boolean;
}

export interface AudioTaskInput {
  trackUrl: string;
  title: string;
}

export type AudioTaskProcessor<TResult> = (
  trackUrl: string,
  signal: AbortSignal
) => Promise<TResult>;

export interface AudioTaskHandle<TResult> {
  id: string;
  result: Promise<TResult>;
  cancel: () => boolean;
}

export type QueueListener = (
  snapshot: AudioQueueSnapshot
) => void;

export class AudioTaskCancelledError extends Error {
  constructor(message = "Audio task cancelled") {
    super(message);
    this.name = "AbortError";
  }
}
