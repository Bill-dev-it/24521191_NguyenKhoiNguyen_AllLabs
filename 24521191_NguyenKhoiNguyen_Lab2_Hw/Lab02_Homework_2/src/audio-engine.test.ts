
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { AudioEngine } from "./audio-engine";

interface MockSource {
  buffer: AudioBuffer | null;
  onended: (() => void) | null;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface MockAudioContext {
  state: AudioContextState;
  currentTime: number;
  destination: object;
  resume: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  createAnalyser: ReturnType<typeof vi.fn>;
  createGain: ReturnType<typeof vi.fn>;
  createBufferSource: ReturnType<typeof vi.fn>;
}

let contexts: MockAudioContext[];
let sources: MockSource[];

function createSource(): MockSource {
  const source: MockSource = {
    buffer: null,
    onended: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  sources.push(source);
  return source;
}

function createMockContext(): MockAudioContext {
  const analyser = {
    fftSize: 256,
    frequencyBinCount: 128,
    smoothingTimeConstant: 0,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteFrequencyData: vi.fn(
      (data: Uint8Array) => data.fill(42)
    ),
    getByteTimeDomainData: vi.fn(
      (data: Uint8Array) => data.fill(128)
    ),
  };

  Object.defineProperty(analyser, "frequencyBinCount", {
    get() {
      return analyser.fftSize / 2;
    },
  });

  const gain = {
    gain: {
      value: 0.75,
      setTargetAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const context: MockAudioContext = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn(async () => {}),
    close: vi.fn(async () => {
      context.state = "closed";
    }),
    createAnalyser: vi.fn(() => analyser),
    createGain: vi.fn(() => gain),
    createBufferSource: vi.fn(() => createSource()),
  };

  contexts.push(context);
  return context;
}

function mockBuffer(duration = 10): AudioBuffer {
  return { duration } as AudioBuffer;
}

beforeEach(() => {
  contexts = [];
  sources = [];

  vi.stubGlobal(
    "AudioContext",
    vi.fn(function () {
      return createMockContext();
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("AudioEngine - Lifecycle & Memory Safety", () => {
  it("initializes one AudioContext", async () => {
    const engine = new AudioEngine();

    await engine.initialize();
    await engine.initialize();

    expect(contexts).toHaveLength(1);
    expect(contexts[0].createAnalyser)
      .toHaveBeenCalledOnce();
    expect(contexts[0].createGain)
      .toHaveBeenCalledOnce();

    await engine.dispose();
  });

  it("rejects playback without an AudioBuffer", async () => {
    const engine = new AudioEngine();

    await expect(engine.play()).rejects.toThrow(
      "No decoded AudioBuffer"
    );

    await engine.dispose();
  });

  it("creates one active source during playback", async () => {
    const engine = new AudioEngine();
    engine.loadBuffer(mockBuffer());

    await engine.play();

    expect(sources).toHaveLength(1);
    expect(sources[0].start).toHaveBeenCalledOnce();
    expect(engine.getSnapshot().activeSources).toBe(1);
    expect(engine.getStatus()).toBe("playing");

    await engine.dispose();
  });

  it("stops and disconnects source when paused", async () => {
    const engine = new AudioEngine();
    engine.loadBuffer(mockBuffer());

    await engine.play();
    engine.pause();

    expect(sources[0].stop).toHaveBeenCalledOnce();
    expect(sources[0].disconnect)
      .toHaveBeenCalledOnce();
    expect(engine.getSnapshot().activeSources).toBe(0);
    expect(engine.getStatus()).toBe("paused");

    await engine.dispose();
  });

  it("creates a fresh source on resume", async () => {
    const engine = new AudioEngine();
    engine.loadBuffer(mockBuffer());

    await engine.play();

    contexts[0].currentTime = 3;
    engine.pause();

    await engine.resume();

    expect(sources).toHaveLength(2);
    expect(sources[0].stop).toHaveBeenCalled();
    expect(sources[1].start)
      .toHaveBeenCalledWith(0, 3);

    await engine.dispose();
  });

  it("supports FFT 256 and 512 configurations", async () => {
    const engine = new AudioEngine();

    await engine.initialize();

    engine.setFFTSize(256);
    expect(engine.getFrequencyBinCount()).toBe(128);

    engine.setFFTSize(512);
    expect(engine.getFrequencyBinCount()).toBe(256);

    expect(engine.getFrequencyData().length).toBe(256);
    expect(engine.getWaveformData().length).toBe(512);

    await engine.dispose();
  });

  it("clamps volume to the valid range", async () => {
    const engine = new AudioEngine();

    await engine.initialize();

    engine.setVolume(2);
    expect(engine.getVolume()).toBe(1);

    engine.setVolume(-5);
    expect(engine.getVolume()).toBe(0);

    engine.setVolume(0.5);
    expect(engine.getVolume()).toBe(0.5);

    await engine.dispose();
  });

  it("disposes all audio resources safely", async () => {
    const engine = new AudioEngine();
    engine.loadBuffer(mockBuffer());

    await engine.play();
    await engine.dispose();

    expect(sources[0].stop).toHaveBeenCalled();
    expect(sources[0].disconnect).toHaveBeenCalled();
    expect(contexts[0].close).toHaveBeenCalledOnce();

    expect(engine.getSnapshot().disposed).toBe(true);
    expect(engine.getSnapshot().activeSources).toBe(0);

    await engine.dispose();

    expect(contexts[0].close).toHaveBeenCalledOnce();
  });
});
