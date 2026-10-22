
import { describe, expect, it, vi } from "vitest";

import {
  createAntiDriftTimer,
  formatCountdown,
} from "./anti-drift-timer";

function createFakeScheduler() {
  let currentTime = 100_000;
  let nextId = 0;

  const pending = new Map<
    number,
    FrameRequestCallback
  >();

  const cancelFrame = vi.fn((id: number) => {
    pending.delete(id);
  });

  const requestFrame = vi.fn(
    (callback: FrameRequestCallback): number => {
      const id = ++nextId;
      pending.set(id, callback);
      return id;
    }
  );

  return {
    now: () => currentTime,
    requestFrame,
    cancelFrame,

    advanceBy(ms: number) {
      currentTime += ms;

      const callbacks = [...pending.values()];
      pending.clear();

      for (const callback of callbacks) {
        callback(currentTime);
      }
    },

    pendingCount() {
      return pending.size;
    },
  };
}

describe("FlashVault Anti-Drift Timer", () => {
  it("publishes initial duration immediately", () => {
    const scheduler = createFakeScheduler();
    const onTick = vi.fn();

    const timer = createAntiDriftTimer(
      10_000,
      onTick,
      scheduler
    );

    expect(onTick).toHaveBeenCalledOnce();

    expect(timer.getSnapshot()).toMatchObject({
      remainingMs: 10_000,
      elapsedMs: 0,
      status: "running",
      deadline: 110_000,
    });

    timer.cancel();
  });

  it("uses the actual deadline rather than callback count", () => {
    const scheduler = createFakeScheduler();
    const onTick = vi.fn();

    const timer = createAntiDriftTimer(
      10_000,
      onTick,
      scheduler
    );

    scheduler.advanceBy(1_350);

    expect(timer.getSnapshot().remainingMs)
      .toBe(8_650);

    scheduler.advanceBy(2_725);

    expect(timer.getSnapshot().remainingMs)
      .toBe(5_925);

    timer.cancel();
  });

  it("does not accumulate drift after delayed frames", () => {
    const scheduler = createFakeScheduler();

    const timer = createAntiDriftTimer(
      5_000,
      vi.fn(),
      scheduler
    );

    scheduler.advanceBy(4_750);

    expect(timer.getSnapshot().remainingMs)
      .toBe(250);

    scheduler.advanceBy(250);

    expect(timer.getSnapshot()).toMatchObject({
      remainingMs: 0,
      status: "completed",
    });

    expect(scheduler.pendingCount()).toBe(0);
  });

  it("clamps remaining time at zero", () => {
    const scheduler = createFakeScheduler();

    const timer = createAntiDriftTimer(
      2_000,
      vi.fn(),
      scheduler
    );

    scheduler.advanceBy(10_000);

    expect(timer.getSnapshot().remainingMs).toBe(0);
    expect(timer.getSnapshot().status)
      .toBe("completed");
  });

  it("cancels scheduled animation frames", () => {
    const scheduler = createFakeScheduler();
    const onTick = vi.fn();

    const timer = createAntiDriftTimer(
      5_000,
      onTick,
      scheduler
    );

    expect(scheduler.pendingCount()).toBe(1);

    timer.cancel();

    expect(timer.isRunning()).toBe(false);
    expect(scheduler.cancelFrame)
      .toHaveBeenCalledOnce();

    expect(scheduler.pendingCount()).toBe(0);

    scheduler.advanceBy(1_000);

    expect(onTick).toHaveBeenCalledOnce();
  });

  it("supports idempotent cancellation", () => {
    const scheduler = createFakeScheduler();

    const timer = createAntiDriftTimer(
      3_000,
      vi.fn(),
      scheduler
    );

    timer.cancel();
    timer.cancel();

    expect(scheduler.cancelFrame)
      .toHaveBeenCalledOnce();
    expect(timer.getSnapshot().status)
      .toBe("cancelled");
  });

  it("completes zero-duration countdown immediately", () => {
    const scheduler = createFakeScheduler();
    const onTick = vi.fn();

    const timer = createAntiDriftTimer(
      0,
      onTick,
      scheduler
    );

    expect(timer.getSnapshot()).toMatchObject({
      remainingMs: 0,
      status: "completed",
    });

    expect(onTick).toHaveBeenCalledOnce();
    expect(scheduler.pendingCount()).toBe(0);
  });

  it("rejects negative and invalid durations", () => {
    expect(() =>
      createAntiDriftTimer(-100, vi.fn())
    ).toThrow(RangeError);

    expect(() =>
      createAntiDriftTimer(Number.NaN, vi.fn())
    ).toThrow(RangeError);

    expect(() =>
      createAntiDriftTimer(Infinity, vi.fn())
    ).toThrow(RangeError);
  });

  it("formats countdown values correctly", () => {
    expect(formatCountdown(0))
      .toBe("00:00:00");

    expect(formatCountdown(1))
      .toBe("00:00:01");

    expect(formatCountdown(61_000))
      .toBe("00:01:01");

    expect(formatCountdown(3_661_000))
      .toBe("01:01:01");
  });
});
