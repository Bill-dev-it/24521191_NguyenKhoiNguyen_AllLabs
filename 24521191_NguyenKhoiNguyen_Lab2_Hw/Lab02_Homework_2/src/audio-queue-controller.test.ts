
import { describe, expect, it, vi } from "vitest";
import { AudioTaskQueue } from "./audio-queue-controller";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("AudioTaskQueue - FIFO Controller", () => {
  it("preserves strict FIFO processing order", async () => {
    const execution: string[] = [];

    const queue = new AudioTaskQueue<string>(
      async (url) => {
        execution.push(`start:${url}`);
        await Promise.resolve();
        execution.push(`end:${url}`);
        return url;
      }
    );

    const a = queue.enqueue({
      trackUrl: "track-a.mp3",
      title: "Track A",
    });

    const b = queue.enqueue({
      trackUrl: "track-b.mp3",
      title: "Track B",
    });

    const c = queue.enqueue({
      trackUrl: "track-c.mp3",
      title: "Track C",
    });

    expect(await Promise.all([
      a.result,
      b.result,
      c.result,
    ])).toEqual([
      "track-a.mp3",
      "track-b.mp3",
      "track-c.mp3",
    ]);

    expect(execution).toEqual([
      "start:track-a.mp3",
      "end:track-a.mp3",
      "start:track-b.mp3",
      "end:track-b.mp3",
      "start:track-c.mp3",
      "end:track-c.mp3",
    ]);

    queue.dispose();
  });

  it("never processes two tasks simultaneously", async () => {
    const gate = deferred<string>();
    let activeCount = 0;
    let maxActive = 0;

    const queue = new AudioTaskQueue<string>(
      async (url) => {
        activeCount++;
        maxActive = Math.max(maxActive, activeCount);

        const result =
          url === "a.mp3"
            ? await gate.promise
            : url;

        activeCount--;
        return result;
      }
    );

    const a = queue.enqueue({
      trackUrl: "a.mp3",
      title: "A",
    });

    const b = queue.enqueue({
      trackUrl: "b.mp3",
      title: "B",
    });

    const c = queue.enqueue({
      trackUrl: "c.mp3",
      title: "C",
    });

    expect(queue.getSnapshot().pendingCount).toBe(2);
    expect(maxActive).toBe(1);

    gate.resolve("a.mp3");

    await Promise.all([
      a.result,
      b.result,
      c.result,
    ]);

    expect(maxActive).toBe(1);
    queue.dispose();
  });

  it("cancels pending tasks without interrupting the active task", async () => {
    const gate = deferred<string>();
    const processor = vi.fn(async (url: string) => {
      if (url === "a.mp3") {
        return gate.promise;
      }

      return url;
    });

    const queue = new AudioTaskQueue(processor);

    const a = queue.enqueue({
      trackUrl: "a.mp3",
      title: "A",
    });

    const b = queue.enqueue({
      trackUrl: "b.mp3",
      title: "B",
    });

    const c = queue.enqueue({
      trackUrl: "c.mp3",
      title: "C",
    });

    const cancelled = expect(b.result).rejects.toMatchObject({
      name: "AbortError",
    });

    expect(b.cancel()).toBe(true);
    await cancelled;

    gate.resolve("a.mp3");

    expect(await a.result).toBe("a.mp3");
    expect(await c.result).toBe("c.mp3");

    expect(processor).toHaveBeenCalledTimes(2);

    queue.dispose();
  });

  it("rejects an active cancelled task and discards its late result", async () => {
    const gate = deferred<string>();

    const queue = new AudioTaskQueue<string>(
      async (url) =>
        url === "a.mp3"
          ? gate.promise
          : Promise.resolve(url)
    );

    const a = queue.enqueue({
      trackUrl: "a.mp3",
      title: "A",
    });

    const b = queue.enqueue({
      trackUrl: "b.mp3",
      title: "B",
    });

    const cancelled = expect(a.result).rejects.toMatchObject({
      name: "AbortError",
    });

    expect(a.cancel()).toBe(true);
    await cancelled;

    // The active processor finishes before B starts.
    expect(queue.getSnapshot().activeTaskId).toBe(a.id);

    gate.resolve("late-audio-result");

    expect(await b.result).toBe("b.mp3");

    const snapshot = queue.getSnapshot();

    expect(
      snapshot.tasks.find((task) => task.id === a.id)?.status
    ).toBe("cancelled");

    expect(
      snapshot.tasks.find((task) => task.id === b.id)?.status
    ).toBe("completed");

    queue.dispose();
  });

  it("continues processing after a task fails", async () => {
    const queue = new AudioTaskQueue<string>(
      async (url) => {
        if (url === "bad.mp3") {
          throw new Error("Download failed");
        }

        return url;
      }
    );

    const bad = queue.enqueue({
      trackUrl: "bad.mp3",
      title: "Invalid Track",
    });

    const good = queue.enqueue({
      trackUrl: "good.mp3",
      title: "Valid Track",
    });

    await expect(bad.result).rejects.toThrow(
      "Download failed"
    );

    expect(await good.result).toBe("good.mp3");

    queue.dispose();
  });

  it("does not permit enqueue after disposal", () => {
    const queue = new AudioTaskQueue<string>(
      async (url) => url
    );

    queue.dispose();

    expect(() =>
      queue.enqueue({
        trackUrl: "test.mp3",
        title: "Test",
      })
    ).toThrow("disposed");
  });
});
