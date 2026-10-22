

export type PlaybackStatus =
  | "idle"
  | "ready"
  | "playing"
  | "paused"
  | "stopped";

export type FFTSize = 256 | 512;

export interface AudioEngineSnapshot {
  status: PlaybackStatus;
  duration: number;
  currentTime: number;
  volume: number;
  fftSize: FFTSize;
  frequencyBins: number;
  activeSources: number;
  disposed: boolean;
}

export type AudioEngineListener = (
  snapshot: AudioEngineSnapshot
) => void;

/**
 * SonicFlow Web Audio Engine
 *
 * Responsibilities:
 * - Initialize AudioContext on user interaction
 * - Play decoded AudioBuffer
 * - Pause/resume from playback offset
 * - Expose analyser data for Canvas visualization
 * - Enforce source node cleanup
 * - Dispose of audio resources safely
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;

  private audioBuffer: AudioBuffer | null = null;
  private status: PlaybackStatus = "idle";

  private volume = 0.75;
  private fftSize: FFTSize = 256;

  private startedAt = 0;
  private pausedOffset = 0;

  private disposed = false;
  private sourceGeneration = 0;

  private listeners = new Set<AudioEngineListener>();

  // Prevent concurrent AudioContext initialization.
  private initialization: Promise<void> | null = null;

  // ----------------------------------------
  // Lifecycle
  // ----------------------------------------

  async initialize(): Promise<void> {
    this.assertAvailable();

    if (this.context) {
      if (this.context.state === "suspended") {
        await this.context.resume();
      }
      return;
    }

    if (this.initialization) {
      await this.initialization;
      return;
    }

    this.initialization = this.createAudioGraph();

    try {
      await this.initialization;
    } finally {
      this.initialization = null;
    }
  }

  private async createAudioGraph(): Promise<void> {
    const context = new AudioContext();

    try {
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();

      analyser.fftSize = this.fftSize;
      analyser.smoothingTimeConstant = 0.8;

      gainNode.gain.value = this.volume;

      // Source -> Analyser -> Gain -> Destination
      analyser.connect(gainNode);
      gainNode.connect(context.destination);

      this.context = context;
      this.analyser = analyser;
      this.gainNode = gainNode;

      if (context.state === "suspended") {
        await context.resume();
      }

      if (this.disposed) {
        this.disconnectGraph();
        await context.close();
        return;
      }

      this.status = this.audioBuffer
        ? "ready"
        : "idle";

      this.notify();
    } catch (error) {
      this.disconnectGraph();

      if (context.state !== "closed") {
        await context.close();
      }

      this.context = null;
      throw error;
    }
  }

  // ----------------------------------------
  // Audio Buffer
  // ----------------------------------------

  loadBuffer(buffer: AudioBuffer): void {
    this.assertAvailable();

    this.releaseSource();

    this.audioBuffer = buffer;
    this.pausedOffset = 0;
    this.startedAt = 0;
    this.status = "ready";

    this.notify();
  }

  getLoadedBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }

  // ----------------------------------------
  // Playback
  // ----------------------------------------

  async play(): Promise<void> {
    this.assertAvailable();

    if (!this.audioBuffer) {
      throw new Error(
        "No decoded AudioBuffer has been loaded"
      );
    }

    if (this.status === "playing") {
      return;
    }

    await this.initialize();

    this.assertAvailable();

    const context = this.context;
    const analyser = this.analyser;
    const buffer = this.audioBuffer;

    if (!context || !analyser || !buffer) {
      throw new Error("Audio engine is not initialized");
    }

    // Do not reuse an AudioBufferSourceNode.
    this.releaseSource();

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);

    const offset = Math.min(
      this.pausedOffset,
      Math.max(0, buffer.duration - 0.001)
    );

    const generation = ++this.sourceGeneration;

    source.onended = () => {
      // Ignore callbacks from replaced sources.
      if (
        generation !== this.sourceGeneration ||
        this.source !== source
      ) {
        return;
      }

      source.onended = null;
      source.disconnect();

      this.source = null;
      this.startedAt = 0;
      this.pausedOffset = 0;
      this.status = "stopped";

      this.notify();
    };

    try {
      source.start(0, offset);
    } catch (error) {
      source.onended = null;
      source.disconnect();
      throw error;
    }

    this.source = source;
    this.startedAt = context.currentTime - offset;
    this.status = "playing";

    this.notify();
  }

  pause(): void {
    this.assertAvailable();

    if (
      this.status !== "playing" ||
      !this.context ||
      !this.audioBuffer
    ) {
      return;
    }

    this.pausedOffset = Math.min(
      Math.max(
        this.context.currentTime - this.startedAt,
        0
      ),
      this.audioBuffer.duration
    );

    this.releaseSource();
    this.status = "paused";

    this.notify();
  }

  async resume(): Promise<void> {
    this.assertAvailable();

    if (this.status !== "paused") {
      return;
    }

    await this.play();
  }

  stop(): void {
    this.assertAvailable();

    this.releaseSource();

    this.startedAt = 0;
    this.pausedOffset = 0;

    this.status = this.audioBuffer
      ? "stopped"
      : "idle";

    this.notify();
  }

  private releaseSource(): void {
    const source = this.source;

    // Invalidate any previously registered onended callback.
    this.sourceGeneration++;
    this.source = null;

    if (!source) return;

    source.onended = null;

    try {
      source.stop();
    } catch {
      // An already stopped source may throw.
    }

    try {
      source.disconnect();
    } catch {
      // Ignore errors during cleanup.
    }
  }

  // ----------------------------------------
  // Playback Properties
  // ----------------------------------------

  setVolume(value: number): void {
    this.assertAvailable();

    const safeValue = Number.isFinite(value)
      ? Math.max(0, Math.min(1, value))
      : 0;

    this.volume = safeValue;

    if (this.gainNode && this.context) {
      this.gainNode.gain.setTargetAtTime(
        safeValue,
        this.context.currentTime,
        0.01
      );
    }

    this.notify();
  }

  getVolume(): number {
    return this.volume;
  }

  setFFTSize(size: FFTSize): void {
    this.assertAvailable();

    if (size !== 256 && size !== 512) {
      throw new Error(
        "FFT size must be either 256 or 512"
      );
    }

    this.fftSize = size;

    if (this.analyser) {
      this.analyser.fftSize = size;
    }

    this.notify();
  }

  getFFTSize(): FFTSize {
    return this.fftSize;
  }

  getFrequencyBinCount(): number {
    return this.analyser?.frequencyBinCount ??
      this.fftSize / 2;
  }

  getDuration(): number {
    return this.audioBuffer?.duration ?? 0;
  }

  getCurrentTime(): number {
    if (!this.audioBuffer) return 0;

    if (
      this.status === "playing" &&
      this.context
    ) {
      return Math.min(
        Math.max(
          this.context.currentTime - this.startedAt,
          0
        ),
        this.audioBuffer.duration
      );
    }

    return this.pausedOffset;
  }

  getStatus(): PlaybackStatus {
    return this.status;
  }

  // ----------------------------------------
  // Frequency / Waveform Data
  // ----------------------------------------

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getFrequencyData(): Uint8Array<ArrayBuffer> {
    const bins = this.getFrequencyBinCount();
    const data = new Uint8Array(bins);

    if (this.analyser) {
      this.analyser.getByteFrequencyData(data);
    }

    return data;
  }

  getWaveformData(): Uint8Array<ArrayBuffer> {
    const length = this.fftSize;
    const data = new Uint8Array(length);

    // Silence appears as a centered waveform.
    data.fill(128);

    if (this.analyser) {
      this.analyser.getByteTimeDomainData(data);
    }

    return data;
  }

  // ----------------------------------------
  // State Subscription
  // ----------------------------------------

  getSnapshot(): AudioEngineSnapshot {
    return {
      status: this.status,
      duration: this.getDuration(),
      currentTime: this.getCurrentTime(),
      volume: this.volume,
      fftSize: this.fftSize,
      frequencyBins: this.getFrequencyBinCount(),
      activeSources: this.source ? 1 : 0,
      disposed: this.disposed,
    };
  }

  subscribe(
    listener: AudioEngineListener
  ): () => void {
    this.assertAvailable();

    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    if (this.disposed) return;

    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  // ----------------------------------------
  // Memory Cleanup
  // ----------------------------------------

  private disconnectGraph(): void {
    this.releaseSource();

    try {
      this.analyser?.disconnect();
    } catch {
      // Node may already be disconnected.
    }

    try {
      this.gainNode?.disconnect();
    } catch {
      // Node may already be disconnected.
    }

    this.analyser = null;
    this.gainNode = null;
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;

    this.disposed = true;

    this.disconnectGraph();

    this.audioBuffer = null;
    this.startedAt = 0;
    this.pausedOffset = 0;
    this.status = "idle";

    const pendingInit = this.initialization;

    if (pendingInit) {
      try {
        await pendingInit;
      } catch {
        // Initialization errors do not block disposal.
      }
    }

    const context = this.context;
    this.context = null;

    if (context && context.state !== "closed") {
      await context.close();
    }

    this.listeners.clear();
  }

  private assertAvailable(): void {
    if (this.disposed) {
      throw new Error(
        "AudioEngine has already been disposed"
      );
    }
  }
}
