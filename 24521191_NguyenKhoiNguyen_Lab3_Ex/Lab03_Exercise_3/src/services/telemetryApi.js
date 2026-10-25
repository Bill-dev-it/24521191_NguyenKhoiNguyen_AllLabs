
import { PUBG_VN_SQUADS } from "../data/squads.js";

export const PACKET_LOSS_RATE = 0.35;
export const TELEMETRY_DELAY_MS = 1500;

/**
 * Simulated PUBG VN satellite telemetry.
 *
 * Lab02 inheritance:
 * - Promise + setTimeout asynchronous loading
 * - Explicit success and failure outcomes
 *
 * Lab03 upgrades:
 * - 35% simulated packet loss
 * - AbortSignal support
 * - Timer/listener cleanup
 *
 * Options allow deterministic testing without changing
 * the default production-like simulation behavior.
 */
export function fetchTelemetry(
  squadId,
  signal,
  {
    delayMs = TELEMETRY_DELAY_MS,
    random = Math.random,
  } = {}
) {
  return new Promise((resolve, reject) => {
    const squad = PUBG_VN_SQUADS.find(
      (item) => item.id === squadId
    );

    if (signal?.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));
      return;
    }

    if (!squad) {
      reject(new Error(`Unknown squad: ${squadId}`));
      return;
    }

    let timerId;

    const cleanup = () => {
      clearTimeout(timerId);
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Request aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, {
      once: true,
    });

    timerId = setTimeout(() => {
      cleanup();

      if (signal?.aborted) {
        reject(new DOMException("Request aborted", "AbortError"));
        return;
      }

      if (random() < PACKET_LOSS_RATE) {
        reject(
          new Error(
            "Satellite packet timeout: connection lost."
          )
        );
        return;
      }

      resolve({ ...squad });
    }, delayMs);
  });
}
