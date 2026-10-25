import { useEffect, useState } from "react";
import { fetchTelemetry } from "../services/telemetryApi";
import styles from "./PubgMatchTelemetry.module.css";

const INITIAL_VIEW = {
  status: "IDLE",
  data: null,
  error: null,
};

export function PubgMatchTelemetry({ squadId = "te" }) {
  const [view, setView] = useState(INITIAL_VIEW);
  const [retryTick, setRetryTick] = useState(0);

  const handleRetry = () => {
    setRetryTick((previous) => previous + 1);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadTelemetry() {
      setView({
        status: "LOADING",
        data: null,
        error: null,
      });

      try {
        const data = await fetchTelemetry(
          squadId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setView({
            status: "SUCCESS",
            data,
            error: null,
          });
        }
      } catch (error) {
        if (
          controller.signal.aborted ||
          error.name === "AbortError"
        ) {
          return;
        }

        setView({
          status: "ERROR",
          data: null,
          error: error.message,
        });
      }
    }

    // Schedule loading outside the synchronous effect body.
    // This also lets StrictMode cleanup cancel obsolete work.
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void loadTelemetry();
      }
    });
    return () => {
    return () => {
      controller.abort();
    };
  }, [squadId, retryTick]);

  return (
    <section
      className={styles.telemetry}
      aria-labelledby="telemetry-heading"
      aria-busy={view.status === "LOADING"}
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          PUBG VIETNAM SERIES / SATELLITE FEED
        </p>
        <h1 id="telemetry-heading">
          Live Match Telemetry
        </h1>
        <p className={styles.subtitle}>
          Simulated battlefield intelligence · 35% packet loss
        </p>
      </header>

      {view.status === "IDLE" && (
        <p className={styles.message}>
          Initializing satellite connection...
        </p>
      )}

      {view.status === "LOADING" && (
        <section
          className={styles.skeleton}
          aria-label="Loading match telemetry"
          role="status"
        >
          <div className={styles.radar} aria-hidden="true">
            <span className={styles.radarRing} />
            <span className={styles.radarCore} />
          </div>
          <p>Scanning Blue Zone telemetry...</p>
        </section>
      )}

      {view.status === "SUCCESS" && (
        <article className={styles.result}>
          <div className={styles.resultHeader}>
            <p className={styles.eyebrow}>CONNECTION ESTABLISHED</p>
            <h2>{view.data.name}</h2>
            <p>{view.data.status}</p>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>Map</dt>
              <dd>{view.data.map}</dd>
            </div>
            <div>
              <dt>Phase</dt>
              <dd>{view.data.phase}</dd>
            </div>
            <div>
              <dt>Alive</dt>
              <dd>{view.data.alive}</dd>
            </div>
            <div>
              <dt>Kills</dt>
              <dd>{view.data.kills}</dd>
            </div>
            <div>
              <dt>WWCD Probability</dt>
              <dd>{view.data.wwcdProb}</dd>
            </div>
          </dl>
        </article>
      )}

      {view.status === "ERROR" && (
        <section className={styles.error} role="alert">
          <h2>Blue-Zone Link Lost</h2>

          <p>{view.error}</p>

          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
          >
            Reconnect Satellite (Retry)
          </button>
        </section>
      )}
    </section>
  );
}
