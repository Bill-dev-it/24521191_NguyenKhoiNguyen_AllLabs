
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AudioEngine } from "./audio-engine";
import { AudioLoader } from "./audio-loader";
import { AudioTaskQueue } from "./audio-queue-controller";
import type {
  AudioQueueSnapshot,
  AudioTaskHandle,
} from "./audio-types";
import AudioVisualizer from "./AudioVisualizer";
import "./App.css";

type LoadedTrack = {
  id: string;
  title: string;
  buffer: AudioBuffer;
};

type QueueItem = {
  id: string;
  title: string;
  status: string;
};

const DEMO_TRACKS = [
  { title: "Neon Pulse", frequency: 220 },
  { title: "Cyber Rhythm", frequency: 330 },
  { title: "Midnight Signal", frequency: 440 },
];

// Generate a short playable WAV file entirely in the browser.
function createDemoWav(frequency: number): Blob {
  const sampleRate = 22050;
  const seconds = 5;
  const samples = sampleRate * seconds;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t * 5) *
      Math.min(1, (seconds - t) * 3);

    const beat = 0.55 + 0.45 *
      Math.sin(2 * Math.PI * 2 * t) ** 2;

    const signal =
      Math.sin(2 * Math.PI * frequency * t) * 0.42 +
      Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.18;

    const value = Math.max(
      -1,
      Math.min(1, signal * envelope * beat)
    );

    view.setInt16(44 + i * 2, value * 32767, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

const EMPTY_SNAPSHOT: AudioQueueSnapshot = {
  tasks: [],
  activeTaskId: null,
  pendingCount: 0,
  isProcessing: false,
};

function createAudioEngineStore() {
  let engine: AudioEngine | null = null;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => engine,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set: (nextEngine: AudioEngine | null) => {
      if (engine === nextEngine) return;
      engine = nextEngine;
      listeners.forEach((listener) => listener());
    },
  };
}

export default function App() {
  const engineRef = useRef<AudioEngine | null>(null);
  const queueRef = useRef<AudioTaskQueue<AudioBuffer> | null>(null);
  const decoderRef = useRef<AudioContext | null>(null);
  const urlsRef = useRef<Set<string>>(new Set());
  const handlesRef = useRef(
    new Map<string, AudioTaskHandle<AudioBuffer>>()
  );

  const [engineStore] = useState(createAudioEngineStore);
  const engine = useSyncExternalStore(
    engineStore.subscribe,
    engineStore.getSnapshot,
    engineStore.getSnapshot
  );
  const [snapshot, setSnapshot] =
    useState<AudioQueueSnapshot>(EMPTY_SNAPSHOT);

  const [loadedTracks, setLoadedTracks] =
    useState<LoadedTrack[]>([]);
  const [queueItems, setQueueItems] =
    useState<QueueItem[]>([]);
  const [currentTrack, setCurrentTrack] =
    useState<LoadedTrack | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [customUrl, setCustomUrl] = useState("");
  const [notice, setNotice] = useState(
    "Audio workstation initialized."
  );
  const [busy, setBusy] = useState(false);

  // Initialize independent queue and playback engine.
  useEffect(() => {
    const audioEngine = new AudioEngine();
    const urls = urlsRef.current;
    const handles = handlesRef.current;
    engineRef.current = audioEngine;
    engineStore.set(audioEngine);

    let active = true;

    const processor = async (
      url: string,
      signal: AbortSignal
    ): Promise<AudioBuffer> => {
      // A dedicated decoding context is reused for queue tasks.
      if (!decoderRef.current) {
        decoderRef.current = new AudioContext();
      }

      const loader = new AudioLoader(decoderRef.current);
      return loader.load(url, signal);
    };

    const queue = new AudioTaskQueue<AudioBuffer>(processor);
    queueRef.current = queue;

    const unsubscribe = queue.subscribe((next) => {
      if (!active) return;
      setSnapshot(next);
      setQueueItems(
        next.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
        }))
      );
    });

    return () => {
      active = false;
      unsubscribe();
      queue.dispose();
      queueRef.current = null;
      engineRef.current = null;
      engineStore.set(null);

      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
      handles.clear();

      const decoder = decoderRef.current;
      decoderRef.current = null;
      if (decoder && decoder.state !== "closed") {
        void decoder.close();
      }

      void audioEngine.dispose();
    };
  }, [engineStore]);

  function enqueueAudio(url: string, title: string) {
    const queue = queueRef.current;
    if (!queue) return;

    let handle: AudioTaskHandle<AudioBuffer>;

    try {
      handle = queue.enqueue({
        trackUrl: url,
        title,
      });
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Queue error"
      );
      return;
    }

    handlesRef.current.set(handle.id, handle);
    setNotice(`Queued: ${title}`);

    // Always handle the task promise to prevent unhandled rejections.
    void handle.result.then(
      (buffer) => {
        setLoadedTracks((previous) => [
          ...previous,
          { id: handle.id, title, buffer },
        ]);
        setNotice(`Ready to play: ${title}`);
      },
      (error: unknown) => {
        const message = error instanceof Error
          ? error.message
          : "Unknown error";
        setNotice(`${title}: ${message}`);
      }
    ).finally(() => {
      handlesRef.current.delete(handle.id);
      if (urlsRef.current.delete(url)) {
        URL.revokeObjectURL(url);
      }
    });
  }

  function enqueueDemo(
    title: string,
    frequency: number
  ) {
    const url = URL.createObjectURL(createDemoWav(frequency));
    urlsRef.current.add(url);
    enqueueAudio(url, title);
  }

  function addCustomUrl() {
    const url = customUrl.trim();
    if (!url) return;

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
      enqueueAudio(parsed.href, "External Audio");
      setCustomUrl("");
    } catch {
      setNotice("Please enter a valid HTTP or HTTPS URL.");
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;

    const url = URL.createObjectURL(file);
    urlsRef.current.add(url);
    enqueueAudio(url, file.name);
  }

  async function playTrack(track: LoadedTrack) {
    const audioEngine = engineRef.current;
    if (!audioEngine || busy) return;

    setBusy(true);

    try {
      if (currentTrack?.id !== track.id) {
        audioEngine.loadBuffer(track.buffer);
      }

      await audioEngine.play();
      setCurrentTrack(track);
      setPlaying(true);
      setNotice(`Playing: ${track.title}`);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Playback failed"
      );
    } finally {
      setBusy(false);
    }
  }

  async function togglePlayback() {
    const audioEngine = engineRef.current;
    if (!audioEngine || !currentTrack || busy) return;

    if (audioEngine.getStatus() === "playing") {
      audioEngine.pause();
      setPlaying(false);
      setNotice("Playback paused.");
    } else {
      await playTrack(currentTrack);
    }
  }

  function stopPlayback() {
    engineRef.current?.stop();
    setPlaying(false);
    setNotice("Playback stopped.");
  }

  function changeVolume(next: number) {
    setVolume(next);
    engineRef.current?.setVolume(next / 100);
  }

  function cancelTask(id: string) {
    const handle = handlesRef.current.get(id);
    if (handle?.cancel()) {
      setNotice("Queue task cancelled.");
    }
  }

  const completedCount = snapshot.tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const failedCount = snapshot.tasks.filter(
    (task) =>
      task.status === "failed" ||
      task.status === "cancelled"
  ).length;

  return (
    <main className="sonic-app">
      <header className="sonic-header">
        <div>
          <p className="sonic-eyebrow">
            WEB AUDIO ENGINE / FIFO CONTROLLER
          </p>
          <h1>SONIC<span>FLOW</span></h1>
          <p className="sonic-subtitle">
            Concurrent audio task processing and
            real-time frequency visualization.
          </p>
        </div>
        <span className="sonic-online">● ENGINE READY</span>
      </header>

      <section className="sonic-stats" aria-label="Queue statistics">
        <article>
          <span>Total Tasks</span>
          <strong>{snapshot.tasks.length}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{snapshot.pendingCount}</strong>
        </article>
        <article>
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>
        <article>
          <span>Failed / Cancelled</span>
          <strong>{failedCount}</strong>
        </article>
      </section>

      <div className="sonic-layout">
        <div className="sonic-main-column">
          <section className="sonic-panel">
            <div className="sonic-section-header">
              <div>
                <p className="sonic-eyebrow">TRACK INPUT</p>
                <h2>Audio Library</h2>
              </div>
              <span className="sonic-tag">DEMO + LOCAL</span>
            </div>

            <div className="demo-tracks">
              {DEMO_TRACKS.map((track, index) => (
                <div className="demo-track" key={track.title}>
                  <div className="track-icon">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="track-info">
                    <strong>{track.title}</strong>
                    <span>Generated WAV · 5 seconds</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      enqueueDemo(track.title, track.frequency)
                    }
                  >
                    + Queue
                  </button>
                </div>
              ))}
            </div>

            <div className="sonic-inputs">
              <label className="file-input-label">
                Select MP3/WAV file
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(event) => {
                    handleFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>

              <div className="url-input">
                <label htmlFor="audio-url">External audio URL</label>
                <div>
                  <input
                    id="audio-url"
                    type="url"
                    value={customUrl}
                    placeholder="https://example.com/audio.mp3"
                    onChange={(event) =>
                      setCustomUrl(event.target.value)
                    }
                  />
                  <button type="button" onClick={addCustomUrl}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </section>

          <AudioVisualizer engine={engine} />

          <section className="sonic-panel" aria-label="Audio player">
            <div className="sonic-section-header">
              <div>
                <p className="sonic-eyebrow">PLAYBACK CONTROL</p>
                <h2>Audio Player</h2>
              </div>
            </div>

            <div className="now-playing">
              <span>NOW PLAYING</span>
              <strong>
                {currentTrack?.title ?? "No track selected"}
              </strong>
            </div>

            <div className="player-buttons">
              <button
                type="button"
                disabled={!currentTrack || busy}
                onClick={() => void togglePlayback()}
              >
                {playing ? "Pause" : "Play / Resume"}
              </button>
              <button
                type="button"
                disabled={!currentTrack}
                onClick={stopPlayback}
              >
                Stop
              </button>
            </div>

            <div className="volume-control">
              <label htmlFor="volume">
                Volume: {volume}%
              </label>
              <input
                id="volume"
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) =>
                  changeVolume(Number(event.target.value))
                }
              />
            </div>

            <p className="sonic-notice" role="status">
              {notice}
            </p>
          </section>
        </div>

        <aside className="sonic-sidebar">
          <section className="sonic-panel">
            <div className="sonic-section-header">
              <div>
                <p className="sonic-eyebrow">ASYNC PIPELINE</p>
                <h2>FIFO Task Queue</h2>
              </div>
              <span className="sonic-tag">
                {snapshot.isProcessing ? "ACTIVE" : "IDLE"}
              </span>
            </div>

            <div className="queue-list">
              {queueItems.length === 0 ? (
                <p className="sonic-empty">
                  No tasks. Add a track to begin.
                </p>
              ) : (
                queueItems.map((task) => (
                  <div className="queue-item" key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <span className={`queue-status ${task.status}`}>
                        {task.status}
                      </span>
                    </div>
                    {["queued", "processing"].includes(
                      task.status
                    ) && (
                      <button
                        type="button"
                        onClick={() => cancelTask(task.id)}
                        aria-label={`Cancel ${task.title}`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="sonic-panel">
            <div className="sonic-section-header">
              <div>
                <p className="sonic-eyebrow">DECODED BUFFER STORE</p>
                <h2>Ready Tracks</h2>
              </div>
            </div>

            <div className="queue-list">
              {loadedTracks.length === 0 ? (
                <p className="sonic-empty">
                  Decoded tracks will appear here.
                </p>
              ) : (
                loadedTracks.map((track) => (
                  <div className="queue-item" key={track.id}>
                    <div>
                      <strong>{track.title}</strong>
                      <span className="queue-status completed">
                        {track.buffer.duration.toFixed(1)}s ready
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void playTrack(track)}
                    >
                      Play
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      <footer className="sonic-footer">
        <span>SONICFLOW / WEB AUDIO WORKSTATION</span>
        <span>FIFO · ABORTCONTROLLER · FFT · CANVAS</span>
      </footer>
    </main>
  );
}
