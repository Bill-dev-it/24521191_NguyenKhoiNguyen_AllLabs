
import { AudioTaskCancelledError } from "./audio-types";
import type { AudioTaskProcessor } from "./audio-types";

// Minimal decoder contract for dependency injection.
// AudioContext satisfies this interface.
export interface AudioDecoder {
  decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer>;
}

export interface AudioLoaderOptions {
  fetcher?: typeof fetch;
  maxFileSize?: number;
}

const DEFAULT_MAX_FILE_SIZE = 30 * 1024 * 1024;

export class AudioLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioLoadError";
  }
}

export class AudioLoader {
  private readonly decoder: AudioDecoder;
  private readonly fetcher: typeof fetch;
  private readonly maxFileSize: number;

  constructor(
    decoder: AudioDecoder,
    options: AudioLoaderOptions = {}
  ) {
    this.decoder = decoder;
    this.fetcher = options.fetcher ?? fetch;
    this.maxFileSize =
      options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
  }

  private assertNotCancelled(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new AudioTaskCancelledError(
        "Audio loading was cancelled"
      );
    }
  }

  async load(
    trackUrl: string,
    signal: AbortSignal
  ): Promise<AudioBuffer> {
    this.assertNotCancelled(signal);

    let response: Response;

    try {
      response = await this.fetcher(trackUrl, {
        method: "GET",
        signal,
      });
    } catch (error) {
      if (signal.aborted) {
        throw new AudioTaskCancelledError();
      }

      throw new AudioLoadError(
        `Network error while downloading ${trackUrl}: ${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`
      );
    }

    this.assertNotCancelled(signal);

    if (!response.ok) {
      throw new AudioLoadError(
        `HTTP ${response.status}: Failed to load audio`
      );
    }

    const contentLength = Number(
      response.headers.get("content-length")
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > this.maxFileSize
    ) {
      await response.body?.cancel();
      throw new AudioLoadError(
        "Audio file exceeds maximum allowed size"
      );
    }

    let arrayBuffer: ArrayBuffer;

    try {
      const reader = response.body?.getReader();

      if (!reader) {
        throw new AudioLoadError("Audio response has no body");
      }

      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let receivedBytes = 0;

      try {
        while (true) {
          this.assertNotCancelled(signal);

          const { done, value } = await reader.read();

          if (done) break;

          receivedBytes += value.byteLength;

          if (receivedBytes > this.maxFileSize) {
            await reader.cancel();
            throw new AudioLoadError(
              "Audio file exceeds maximum allowed size"
            );
          }

          chunks.push(new Uint8Array(value));
        }
      } finally {
        reader.releaseLock();
      }

      arrayBuffer = new ArrayBuffer(receivedBytes);
      const output = new Uint8Array(arrayBuffer);

      let offset = 0;

      for (const chunk of chunks) {
        output.set(chunk, offset);
        offset += chunk.byteLength;
      }
    } catch (error) {
      if (signal.aborted) {
        throw new AudioTaskCancelledError();
      }

      if (error instanceof AudioLoadError) {
        throw error;
      }

      throw new AudioLoadError(
        "Failed to read audio response"
      );
    }

    this.assertNotCancelled(signal);

    if (arrayBuffer.byteLength === 0) {
      throw new AudioLoadError("Audio file is empty");
    }

    try {
      const decoded = await this.decoder.decodeAudioData(arrayBuffer);

      // Decoding cannot be directly aborted.
      // Discard results if cancellation happened meanwhile.
      this.assertNotCancelled(signal);

      return decoded;
    } catch (error) {
      if (signal.aborted) {
        throw new AudioTaskCancelledError();
      }

      throw new AudioLoadError(
        `Audio decoding failed: ${
          error instanceof Error
            ? error.message
            : "Invalid audio format"
        }`
      );
    }
  }

  createProcessor(): AudioTaskProcessor<AudioBuffer> {
    return (trackUrl, signal) =>
      this.load(trackUrl, signal);
  }
}
