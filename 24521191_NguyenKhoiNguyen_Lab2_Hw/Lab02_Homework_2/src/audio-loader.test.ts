
import { describe, expect, it, vi } from "vitest";
import { AudioLoader } from "./audio-loader";
import type { AudioDecoder } from "./audio-loader";
import { AudioTaskQueue } from "./audio-queue-controller";

function makeDecoder() {
  const buffer = {} as AudioBuffer;

  const decodeAudioData = vi.fn(
    async (): Promise<AudioBuffer> => buffer
  );

  const decoder: AudioDecoder = {
    decodeAudioData,
  };

  return { decoder, decodeAudioData, buffer };
}

function makeResponse(
  bytes = [1, 2, 3, 4],
  status = 200
): Response {
  return new Response(
    new Uint8Array(bytes),
    {
      status,
      headers: {
        "content-type": "audio/mpeg",
      },
    }
  );
}

describe("AudioLoader - Fetch and Decode", () => {
  it("downloads and decodes valid audio data", async () => {
    const { decoder, decodeAudioData, buffer } =
      makeDecoder();

    const fetcher = vi.fn(
      async () => makeResponse()
    ) as unknown as typeof fetch;

    const loader = new AudioLoader(decoder, {
      fetcher,
    });

    const result = await loader.load(
      "/audio/demo.mp3",
      new AbortController().signal
    );

    expect(result).toBe(buffer);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(decodeAudioData).toHaveBeenCalledOnce();
  });

  it("rejects HTTP errors", async () => {
    const { decoder, decodeAudioData } =
      makeDecoder();

    const fetcher = vi.fn(
      async () => makeResponse([], 404)
    ) as unknown as typeof fetch;

    const loader = new AudioLoader(decoder, {
      fetcher,
    });

    await expect(
      loader.load(
        "/audio/missing.mp3",
        new AbortController().signal
      )
    ).rejects.toThrow("HTTP 404");

    expect(decodeAudioData).not.toHaveBeenCalled();
  });

  it("rejects empty audio responses", async () => {
    const { decoder } = makeDecoder();

    const loader = new AudioLoader(decoder, {
      fetcher: vi.fn(
        async () => makeResponse([])
      ) as unknown as typeof fetch,
    });

    await expect(
      loader.load(
        "/audio/empty.mp3",
        new AbortController().signal
      )
    ).rejects.toThrow("empty");
  });

  it("rejects oversized audio downloads", async () => {
    const { decoder, decodeAudioData } =
      makeDecoder();

    const loader = new AudioLoader(decoder, {
      maxFileSize: 2,
      fetcher: vi.fn(
        async () => makeResponse([1, 2, 3, 4])
      ) as unknown as typeof fetch,
    });

    await expect(
      loader.load(
        "/audio/large.mp3",
        new AbortController().signal
      )
    ).rejects.toThrow("maximum allowed size");

    expect(decodeAudioData).not.toHaveBeenCalled();
  });

  it("rejects tasks cancelled before download", async () => {
    const { decoder } = makeDecoder();
    const fetcher = vi.fn(
      async () => makeResponse()
    );

    const loader = new AudioLoader(decoder, {
      fetcher: fetcher as unknown as typeof fetch,
    });

    const controller = new AbortController();
    controller.abort();

    await expect(
      loader.load("/audio/demo.mp3", controller.signal)
    ).rejects.toMatchObject({
      name: "AbortError",
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("discards decoded results after cancellation", async () => {
    let finishDecode!: (value: AudioBuffer) => void;

    const decodePromise = new Promise<AudioBuffer>(
      (resolve) => {
        finishDecode = resolve;
      }
    );

    const decoder: AudioDecoder = {
      decodeAudioData: vi.fn(() => decodePromise),
    };

    const loader = new AudioLoader(decoder, {
      fetcher: vi.fn(
        async () => makeResponse()
      ) as unknown as typeof fetch,
    });

    const controller = new AbortController();

    const pending = loader.load(
      "/audio/demo.mp3",
      controller.signal
    );

    const assertion = expect(
      pending
    ).rejects.toMatchObject({
      name: "AbortError",
    });

    // Yield until asynchronous download reaches decoding.
    await vi.waitFor(() => {
      expect(decoder.decodeAudioData)
        .toHaveBeenCalledOnce();
    });

    controller.abort();
    finishDecode({} as AudioBuffer);

    await assertion;
  });

  it("integrates with the existing FIFO controller", async () => {
    const { decoder } = makeDecoder();

    const requestedUrls: string[] = [];

    const loader = new AudioLoader(decoder, {
      fetcher: vi.fn(async (url: string | URL | Request) => {
        requestedUrls.push(String(url));
        return makeResponse();
      }) as unknown as typeof fetch,
    });

    const queue = new AudioTaskQueue<AudioBuffer>(
      loader.createProcessor()
    );

    const a = queue.enqueue({
      trackUrl: "/audio/alpha.mp3",
      title: "Alpha",
    });

    const b = queue.enqueue({
      trackUrl: "/audio/beta.mp3",
      title: "Beta",
    });

    const c = queue.enqueue({
      trackUrl: "/audio/gamma.mp3",
      title: "Gamma",
    });

    await Promise.all([
      a.result,
      b.result,
      c.result,
    ]);

    expect(requestedUrls).toEqual([
      "/audio/alpha.mp3",
      "/audio/beta.mp3",
      "/audio/gamma.mp3",
    ]);

    expect(
      queue.getSnapshot().tasks.map((task) => task.status)
    ).toEqual([
      "completed",
      "completed",
      "completed",
    ]);

    queue.dispose();
  });
});
