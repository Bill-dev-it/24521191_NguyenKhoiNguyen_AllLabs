
import { useEffect, useRef, useState } from "react";
import type { AudioEngine, FFTSize } from "./audio-engine";
import "./AudioVisualizer.css";

export type VisualizerMode =
  | "spectrum"
  | "oscilloscope"
  | "circular";

interface AudioVisualizerProps {
  engine: AudioEngine | null;
  className?: string;
}

const MODES: {
  id: VisualizerMode;
  label: string;
}[] = [
  { id: "spectrum", label: "Spectrum" },
  { id: "oscilloscope", label: "Oscilloscope" },
  { id: "circular", label: "Circular" },
];

function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number
) {
  const bars = Math.min(64, data.length);
  const gap = 3;
  const barWidth = (width - gap * (bars - 1)) / bars;

  const gradient = ctx.createLinearGradient(
    0, height, 0, 0
  );

  gradient.addColorStop(0, "#22d3ee");
  gradient.addColorStop(0.55, "#818cf8");
  gradient.addColorStop(1, "#c084fc");

  ctx.fillStyle = gradient;

  for (let i = 0; i < bars; i++) {
    const index = Math.floor(i * data.length / bars);
    const amplitude = data[index] / 255;
    const barHeight = Math.max(3, amplitude * height * 0.85);

    const x = i * (barWidth + gap);
    const y = height - barHeight;

    ctx.fillRect(x, y, barWidth, barHeight);
  }
}

function drawOscilloscope(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number
) {
  if (data.length === 0) return;

  ctx.strokeStyle = "#67e8f9";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 10;

  ctx.beginPath();

  data.forEach((sample, index) => {
    const x = index * width / Math.max(1, data.length - 1);
    const y = (sample / 255) * height;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawCircular(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.22;
  const rays = Math.min(100, data.length);

  ctx.strokeStyle = "#818cf8";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < rays; i++) {
    const index = Math.floor(i * data.length / rays);
    const amplitude = data[index] / 255;

    const angle = (i / rays) * Math.PI * 2 - Math.PI / 2;
    const outerRadius =
      radius + 7 + amplitude * radius * 0.9;

    const startX = centerX + Math.cos(angle) * radius;
    const startY = centerY + Math.sin(angle) * radius;
    const endX = centerX + Math.cos(angle) * outerRadius;
    const endY = centerY + Math.sin(angle) * outerRadius;

    ctx.strokeStyle = i % 2 === 0
      ? "#22d3ee"
      : "#a78bfa";

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  ctx.fillStyle = "#111b34";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e0e7ff";
  ctx.font = "bold 15px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SONICFLOW", centerX, centerY);
}

export default function AudioVisualizer({
  engine,
  className = "",
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<VisualizerMode>("spectrum");
  const [fftSize, setFFTSize] = useState<FFTSize>(
    engine?.getFFTSize() ?? 256
  );
  const [fps, setFps] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState(
    engine?.getStatus() ?? "idle"
  );

  function changeFFTSize(value: FFTSize) {
    try {
      engine?.setFFTSize(value);
      setFFTSize(value);
    } catch (error) {
      console.error("Unable to change FFT size", error);
    }
  }

  useEffect(() => {
    if (!engine) return;

    return engine.subscribe((snapshot) => {
      setPlaybackStatus(snapshot.status);
    });
  }, [engine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let disposed = false;

    let frameCount = 0;
    let lastMeasure = performance.now();

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = (timestamp: number) => {
      if (disposed) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#090f20";
      ctx.fillRect(0, 0, width, height);

      // Decorative baseline.
      ctx.strokeStyle = "#263653";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const playing = engine?.getStatus() === "playing";

      if (playing && engine) {
        if (mode === "oscilloscope") {
          const waveform = engine.getWaveformData();
          drawOscilloscope(ctx, waveform, width, height);
        } else {
          const frequency = engine.getFrequencyData();

          if (mode === "spectrum") {
            drawSpectrum(ctx, frequency, width, height);
          } else {
            drawCircular(ctx, frequency, width, height);
          }
        }
      } else {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          "Load and play a track to visualize audio",
          width / 2,
          height / 2 + 45
        );
      }

      frameCount++;

      const elapsed = timestamp - lastMeasure;

      // Update React telemetry approximately once per second,
      // never on each animation frame.
      if (elapsed >= 1000) {
        setFps(Math.round(frameCount * 1000 / elapsed));
        frameCount = 0;
        lastMeasure = timestamp;
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [engine, mode]);

  return (
    <section
      className={`visualizer-panel ${className}`}
      aria-labelledby="visualizer-title"
    >
      <div className="visualizer-header">
        <div>
          <p className="visualizer-eyebrow">
            REAL-TIME AUDIO ANALYSIS
          </p>
          <h2 id="visualizer-title">
            Audio Visualizer
          </h2>
        </div>

        <span className="visualizer-live">
          <span aria-hidden="true">●</span>
          {playbackStatus === "playing"
            ? "LIVE AUDIO"
            : "STANDBY"}
        </span>
      </div>

      <div
        className="visualizer-modes"
        role="group"
        aria-label="Visualization mode"
      >
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              mode === item.id
                ? "visualizer-mode active"
                : "visualizer-mode"
            }
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="visualizer-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="visualizer-canvas"
          role="img"
          aria-label={`${mode} audio visualization`}
        />
      </div>

      <div className="visualizer-bottom">
        <div className="visualizer-metrics">
          <div className="visualizer-metric">
            <span>FPS</span>
            <strong>{fps}</strong>
          </div>

          <div className="visualizer-metric">
            <span>FFT Bins</span>
            <strong>{fftSize / 2}</strong>
          </div>

          <div className="visualizer-metric">
            <span>Render Target</span>
            <strong>60 FPS</strong>
          </div>
        </div>

        <div className="fft-controls">
          <label htmlFor="fft-size">
            FFT Resolution
          </label>

          <select
            id="fft-size"
            value={fftSize}
            onChange={(event) =>
              changeFFTSize(
                Number(event.target.value) as FFTSize
              )
            }
          >
            <option value={256}>256 FFT</option>
            <option value={512}>512 FFT</option>
          </select>
        </div>
      </div>
    </section>
  );
}
