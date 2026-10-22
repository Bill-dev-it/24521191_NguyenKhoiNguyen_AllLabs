
import { useEffect, useState } from "react";
import {
  createAntiDriftTimer,
  formatCountdown,
} from "./anti-drift-timer";
import { InventoryEngine } from "./inventory-engine";
import { CheckoutEngine } from "./checkout-engine";
import type {
  InventorySnapshot,
  InventoryProduct,
  StockReservation,
} from "./inventory-types";
import {
  FLASH_PRODUCTS,
  formatVND,
  discountPercent,
} from "./product-data";
import "./App.css";

const CAMPAIGN_DURATION = 10 * 60 * 1000;
const LOCK_DURATION = 30_000;

type Notice = {
  text: string;
  kind: "success" | "error" | "info";
};

function createSession() {
  const inventory = new InventoryEngine(FLASH_PRODUCTS);
  const checkout = new CheckoutEngine(inventory);

  return { inventory, checkout };
}

function getTotals(snapshot: InventorySnapshot) {
  return snapshot.products.reduce(
    (acc, product) => ({
      initial: acc.initial + product.initialStock,
      available: acc.available + product.availableStock,
      reserved: acc.reserved + product.reservedQuantity,
      sold: acc.sold + product.soldQuantity,
    }),
    { initial: 0, available: 0, reserved: 0, sold: 0 }
  );
}

function ProductCard({
  product,
  onReserve,
  campaignActive,
}: {
  product: InventoryProduct;
  onReserve: (id: string) => void;
  campaignActive: boolean;
}) {
  const details = FLASH_PRODUCTS.find(
    (entry) => entry.id === product.id
  );

  const discount = discountPercent(
    product.originalPrice,
    product.salePrice
  );

  const ratio = product.initialStock
    ? (product.availableStock / product.initialStock) * 100
    : 0;

  return (
    <article className="fv-product-card">
      <div className="fv-product-art">
        <span className="fv-discount">-{discount}%</span>
        <span className="fv-product-emoji" aria-hidden="true">
          {details?.emoji ?? "🛒"}
        </span>
        <span className="fv-product-badge">
          {details?.badge ?? "FLASH DEAL"}
        </span>
      </div>

      <div className="fv-product-content">
        <p className="fv-category">
          {details?.category ?? "Electronics"}
        </p>

        <h3>{product.name}</h3>

        <p className="fv-description">
          {details?.description}
        </p>

        <div className="fv-price">
          <strong>{formatVND(product.salePrice)}</strong>
          <del>{formatVND(product.originalPrice)}</del>
        </div>

        <div className="fv-stock-heading">
          <span>Available stock</span>
          <strong>{product.availableStock} units</strong>
        </div>

        <div
          className="fv-progress"
          role="progressbar"
          aria-label={`${product.name} available inventory`}
          aria-valuemin={0}
          aria-valuemax={product.initialStock}
          aria-valuenow={product.availableStock}
        >
          <div style={{ width: `${ratio}%` }} />
        </div>

        <div className="fv-stock-details">
          <span>Reserved: {product.reservedQuantity}</span>
          <span>Sold: {product.soldQuantity}</span>
        </div>

        <button
          className="fv-buy-button"
          type="button"
          disabled={
            product.availableStock === 0 ||
            !campaignActive
          }
          onClick={() => onReserve(product.id)}
        >
          {!campaignActive
            ? "Sale Ended"
            : product.availableStock === 0
              ? "Sold Out"
              : "Reserve Now →"}
        </button>
      </div>
    </article>
  );
}

export default function App() {
  // One in-memory domain session per component lifetime.
  const [session] = useState(createSession);

  const [snapshot, setSnapshot] = useState(
    () => session.inventory.getSnapshot()
  );

  const [orders, setOrders] = useState(
    () => session.checkout.getOrders()
  );

  const [remainingMs, setRemainingMs] =
    useState(CAMPAIGN_DURATION);

  const [notice, setNotice] = useState<Notice>({
    text: "FlashVault simulation initialized.",
    kind: "info",
  });

  const [buyerId, setBuyerId] = useState("buyer-001");
  const [busy, setBusy] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const campaignActive = remainingMs > 0;
  const totals = getTotals(snapshot);

  function refresh() {
    setSnapshot(session.inventory.getSnapshot());
    setOrders(session.checkout.getOrders());
    setNowMs(() => Date.now());
  }

  // Countdown and expiry monitor.
  useEffect(() => {
    const timer = createAntiDriftTimer(
      CAMPAIGN_DURATION,
      (state) => {
        setRemainingMs(state.remainingMs);
      }
    );

    session.inventory.startExpiryMonitor(100);

    // Refresh dashboard state and reservation countdowns.
    const refreshId = window.setInterval(() => {
      session.inventory.expireReservations();

      setSnapshot(session.inventory.getSnapshot());
      setOrders(session.checkout.getOrders());
      setNowMs(Date.now());
    }, 200);

    return () => {
      timer.cancel();
      window.clearInterval(refreshId);
      session.inventory.stopExpiryMonitor();
    };
  }, [session]);

  function reserve(productId: string) {
    if (!campaignActive) {
      setNotice({
        text: "Flash sale has ended.",
        kind: "error",
      });
      return;
    }

    const result = session.inventory.reserve(
      productId,
      buyerId.trim() || "guest",
      1,
      LOCK_DURATION
    );

    if (result.success) {
      setNotice({
        text: `Reservation ${result.data.id.slice(0, 8)} created. Checkout within 30 seconds.`,
        kind: "success",
      });
    } else {
      setNotice({
        text: result.message,
        kind: "error",
      });
    }

    refresh();
  }

  function cancelReservation(id: string) {
    const result = session.inventory.cancel(id);

    setNotice({
      text: result.success
        ? "Reservation cancelled. Stock released."
        : result.message,
      kind: result.success ? "info" : "error",
    });

    refresh();
  }

  function checkoutReservation(id: string) {
    const result = session.checkout.checkout(id);

    setNotice({
      text: result.success
        ? `Order confirmed: ${formatVND(result.data.totalPrice)}`
        : result.message,
      kind: result.success ? "success" : "error",
    });

    refresh();
  }

  async function runBurst() {
    if (busy || !campaignActive) return;

    setBusy(true);

    try {
      // Dedicated product with 5 units to demonstrate contention.
      const target = snapshot.products[0];

      const result = await session.checkout.simulateBurst(
        target.id,
        20,
        1
      );

      setNotice({
        text:
          `Burst test: ${result.attempted} buyers, ` +
          `${result.successful} reserved, ` +
          `${result.rejected} rejected.`,
        kind: "info",
      });

      refresh();
    } catch (error) {
      setNotice({
        text: error instanceof Error
          ? error.message
          : "Burst simulation failed",
        kind: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  const activeReservations = snapshot.reservations.filter(
    (reservation) => reservation.status === "reserved"
  );

  const invariantValid = snapshot.products.every(
    (product) =>
      product.initialStock ===
        product.availableStock +
        product.reservedQuantity +
        product.soldQuantity
  );

  return (
    <main className="fv-app">
      <header className="fv-header">
        <div className="fv-brand">
          <span className="fv-brand-mark">F</span>
          <div>
            <strong>FLASH<span>VAULT</span></strong>
            <small>VIETNAM MEGA SALE ENGINE</small>
          </div>
        </div>

        <span className="fv-system-status">
          <span aria-hidden="true">●</span>
          SIMULATION ONLINE
        </span>
      </header>

      <section className="fv-hero">
        <div className="fv-hero-copy">
          <span className="fv-hero-label">
            11.11 / VIETNAM MEGA SALE
          </span>

          <h1>
            THE ULTIMATE
            <span> FLASH SALE.</span>
          </h1>

          <p>
            High-concurrency shopping simulation powered by
            precision timing and inventory reservation controls.
          </p>

          <div className="fv-hero-tags">
            <span>ZERO-DRIFT TIMER</span>
            <span>INVENTORY LOCK</span>
            <span>ATOMIC SIMULATION</span>
          </div>
        </div>

        <div className="fv-countdown-card">
          <p>CAMPAIGN ENDS IN</p>
          <output
            className="fv-countdown"
            aria-label={`Time remaining ${formatCountdown(remainingMs)}`}
          >
            {formatCountdown(remainingMs)}
          </output>
          <span>
            {campaignActive
              ? "FLASH SALE IS LIVE"
              : "CAMPAIGN ENDED"}
          </span>
        </div>
      </section>

      <section
        className="fv-metrics"
        aria-label="Inventory statistics"
      >
        <article>
          <span>Total Inventory</span>
          <strong>{totals.initial}</strong>
          <small>Initial units</small>
        </article>
        <article>
          <span>Available Stock</span>
          <strong>{totals.available}</strong>
          <small>Ready for purchase</small>
        </article>
        <article>
          <span>Reserved Units</span>
          <strong>{totals.reserved}</strong>
          <small>Temporarily locked</small>
        </article>
        <article>
          <span>Sold Units</span>
          <strong>{totals.sold}</strong>
          <small>Confirmed checkout</small>
        </article>
      </section>

      <div className="fv-notice" role="status">
        <span
          className={`fv-notice-dot ${notice.kind}`}
          aria-hidden="true"
        />
        {notice.text}
      </div>

      <div className="fv-layout">
        <section
          className="fv-catalog"
          aria-labelledby="catalog-title"
        >
          <div className="fv-section-heading">
            <div>
              <p className="fv-eyebrow">LIVE FLASH DEALS</p>
              <h2 id="catalog-title">Featured Products</h2>
              <p>
                Limited quantities. Reserve an item before
                completing checkout.
              </p>
            </div>
            <span className="fv-section-tag">
              {snapshot.products.length} PRODUCTS
            </span>
          </div>

          <div className="fv-product-grid">
            {snapshot.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                campaignActive={campaignActive}
                onReserve={reserve}
              />
            ))}
          </div>
        </section>

        <aside className="fv-sidebar">
          <section className="fv-panel">
            <p className="fv-eyebrow">BUYER SESSION</p>
            <h2>Purchase Identity</h2>

            <label htmlFor="buyer-id">
              Buyer ID
            </label>
            <input
              id="buyer-id"
              value={buyerId}
              onChange={(event) =>
                setBuyerId(event.target.value)
              }
              placeholder="buyer-001"
            />

            <p className="fv-helper">
              Change Buyer ID to simulate different shoppers.
            </p>
          </section>

          <section className="fv-panel">
            <div className="fv-panel-heading">
              <div>
                <p className="fv-eyebrow">
                  RESERVATION MANAGER
                </p>
                <h2>Active Locks</h2>
              </div>
              <span className="fv-small-count">
                {activeReservations.length}
              </span>
            </div>

            <div className="fv-lock-list">
              {activeReservations.length === 0 ? (
                <p className="fv-empty">
                  No active reservations.
                </p>
              ) : (
                activeReservations.map(
                  (reservation: StockReservation) => {
                    const product =
                      snapshot.products.find(
                        (p) =>
                          p.id === reservation.productId
                      );

                    const remaining = Math.max(
                      0,
                      reservation.expiresAt - nowMs
                    );

                    return (
                      <article
                        key={reservation.id}
                        className="fv-lock"
                      >
                        <strong>
                          {product?.name ?? reservation.productId}
                        </strong>

                        <span className="fv-lock-buyer">
                          {reservation.buyerId}
                        </span>

                        <div className="fv-lock-timer">
                          <span>LOCK EXPIRES IN</span>
                          <strong>
                            {formatCountdown(remaining)}
                          </strong>
                        </div>

                        <div className="fv-lock-actions">
                          <button
                            type="button"
                            className="fv-primary-button"
                            onClick={() =>
                              checkoutReservation(reservation.id)
                            }
                          >
                            Checkout
                          </button>

                          <button
                            type="button"
                            className="fv-secondary-button"
                            onClick={() =>
                              cancelReservation(reservation.id)
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </article>
                    );
                  }
                )
              )}
            </div>
          </section>

          <section className="fv-panel">
            <p className="fv-eyebrow">
              CONCURRENCY LABORATORY
            </p>
            <h2>Traffic Simulator</h2>

            <p className="fv-helper">
              Simulate 20 simultaneous reservation requests
              competing for the first product's remaining stock.
            </p>

            <button
              type="button"
              className="fv-primary-button fv-full-button"
              onClick={() => void runBurst()}
              disabled={busy || !campaignActive}
            >
              {busy
                ? "Simulating..."
                : "Launch 20-Buyer Burst"}
            </button>

            <p className="fv-helper">
              Uses the current inventory. Refresh the page to
              reset the simulation.
            </p>
          </section>

          <section className="fv-panel">
            <p className="fv-eyebrow">TRANSACTION STATUS</p>
            <h2>Checkout Summary</h2>

            <div className="fv-summary-line">
              <span>Confirmed orders</span>
              <strong>{orders.length}</strong>
            </div>

            <div className="fv-summary-line">
              <span>Total revenue</span>
              <strong>
                {formatVND(
                  session.checkout.getTotalRevenue()
                )}
              </strong>
            </div>

            <div className="fv-summary-line">
              <span>Stock invariant</span>
              <strong className={
                invariantValid ? "fv-valid" : "fv-invalid"
              }>
                {invariantValid ? "VALID" : "VIOLATED"}
              </strong>
            </div>
          </section>
        </aside>
      </div>

      <section className="fv-panel fv-event-section">
        <div className="fv-section-heading">
          <div>
            <p className="fv-eyebrow">
              SYSTEM ACTIVITY
            </p>
            <h2>Transaction Event Log</h2>
          </div>
          <span className="fv-section-tag">
            {snapshot.events.length} EVENTS
          </span>
        </div>

        {snapshot.events.length === 0 ? (
          <p className="fv-empty">
            No transactions recorded yet.
          </p>
        ) : (
          <div className="fv-event-list">
            {[...snapshot.events]
              .reverse()
              .slice(0, 25)
              .map((event) => (
                <div
                  className="fv-event"
                  key={event.id}
                >
                  <span
                    className={`fv-event-type ${event.type.toLowerCase()}`}
                  >
                    {event.type}
                  </span>
                  <span>{event.message}</span>
                  <time>
                    {new Date(event.timestamp)
                      .toLocaleTimeString("vi-VN")}
                  </time>
                </div>
              ))}
          </div>
        )}
      </section>

      <footer className="fv-footer">
        <span>FLASHVAULT / 11.11 ENGINEERING SIMULATION</span>
        <span>
          REACT · TYPESCRIPT · FINITE STATE MACHINE
        </span>
      </footer>
    </main>
  );
}
