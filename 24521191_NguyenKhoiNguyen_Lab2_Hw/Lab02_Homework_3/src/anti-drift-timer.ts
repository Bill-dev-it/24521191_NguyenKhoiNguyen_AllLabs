

/**
 * FlashVault - Precision Anti-Drift Timer
 *
 * Calculates remaining time from an absolute deadline.
 * Does not accumulate setInterval callback delays.
 */

export type TimerStatus =
  | "running"
  | "completed"
  | "cancelled";

export interface TimerSnapshot {
  remainingMs: number;
  elapsedMs: number;
  durationMs: number;
  deadline: number;
  status: TimerStatus;
}

export type TimerListener = (
  snapshot: TimerSnapshot
) => void;

export interface TimerDependencies {
  now?: () => number;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (id: number) => void;
}

export interface AntiDriftTimer {
  getSnapshot(): TimerSnapshot;
  cancel(): void;
  isRunning(): boolean;
}

/**
 * Creates a cancellable deadline-based countdown.
 *
 * The callback runs immediately with the initial snapshot.
 * After completion or cancellation, no future frames run.
 */
export function createAntiDriftTimer(
  durationMs: number,
  onTick: TimerListener,
  dependencies: TimerDependencies = {}
): AntiDriftTimer {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new RangeError(
      "Timer duration must be a finite non-negative number"
    );
  }

  const now = dependencies.now ?? (() => Date.now());

  const requestFrame =
    dependencies.requestFrame ??
    ((callback: FrameRequestCallback) =>
      requestAnimationFrame(callback));

  const cancelFrame =
    dependencies.cancelFrame ??
    ((id: number) => cancelAnimationFrame(id));

  const startTime = now();
  const deadline = startTime + durationMs;

  let status: TimerStatus =
    durationMs === 0 ? "completed" : "running";

  let frameId: number | null = null;

  function getSnapshot(): TimerSnapshot {
    const current = now();

    const remainingMs =
      status === "cancelled"
        ? 0
        : status === "completed"
          ? 0
          : Math.max(0, deadline - current);

    return {
      remainingMs,
      elapsedMs: Math.min(
        durationMs,
        Math.max(0, current - startTime)
      ),
      durationMs,
      deadline,
      status,
    };
  }

  function tick(): void {
    if (status !== "running") return;

    frameId = null;

    const remaining = Math.max(0, deadline - now());

    if (remaining === 0) {
      status = "completed";
    }

    onTick(getSnapshot());

    if (status === "running") {
      frameId = requestFrame(tick);
    }
  }

  function cancel(): void {
    if (status !== "running") return;

    status = "cancelled";

    if (frameId !== null) {
      cancelFrame(frameId);
      frameId = null;
    }
  }

  // Publish the initial state immediately.
  onTick(getSnapshot());

  if (status === "running") {
    frameId = requestFrame(tick);
  }

  return {
    getSnapshot,
    cancel,
    isRunning: () => status === "running",
  };
}

/**
 * Formats milliseconds as HH:MM:SS.
 * Uses ceiling so 1 ms displays 00:00:01.
 */
export function formatCountdown(
  remainingMs: number
): string {
  const totalSeconds = Math.ceil(
    Math.max(0, remainingMs) / 1000
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

