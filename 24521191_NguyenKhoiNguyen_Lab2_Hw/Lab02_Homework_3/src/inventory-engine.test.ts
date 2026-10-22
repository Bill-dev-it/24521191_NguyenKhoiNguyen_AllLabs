
import { describe, expect, it, vi } from "vitest";
import { InventoryEngine } from "./inventory-engine";
import type { ProductInput } from "./inventory-types";

const PRODUCTS: ProductInput[] = [
  {
    id: "PHONE-01",
    name: "FlashVault Smartphone",
    originalPrice: 12000000,
    salePrice: 7990000,
    initialStock: 5,
  },
  {
    id: "HEADSET-01",
    name: "Wireless Headset",
    originalPrice: 1500000,
    salePrice: 890000,
    initialStock: 10,
  },
];

function createEngine() {
  let nextId = 0;

  return new InventoryEngine(PRODUCTS, {
    now: () => 100_000,
    createId: () => `test-${++nextId}`,
  });
}

describe("FlashVault Inventory State Machine", () => {
  it("initializes products with correct stock values", () => {
    const engine = createEngine();
    const product = engine.getProduct("PHONE-01");

    expect(product).toMatchObject({
      initialStock: 5,
      availableStock: 5,
      reservedQuantity: 0,
      soldQuantity: 0,
      version: 0,
    });

    expect(engine.validateInvariants()).toBe(true);
  });

  it("reserves available inventory", () => {
    const engine = createEngine();

    const result = engine.reserve(
      "PHONE-01",
      "buyer-a",
      2
    );

    expect(result.success).toBe(true);

    if (!result.success) return;

    expect(result.data.status).toBe("reserved");
    expect(result.data.quantity).toBe(2);
    expect(result.data.expiresAt).toBe(130_000);

    expect(engine.getProduct("PHONE-01")).toMatchObject({
      availableStock: 3,
      reservedQuantity: 2,
      soldQuantity: 0,
      version: 1,
    });
  });

  it("rejects requests exceeding available stock", () => {
    const engine = createEngine();

    const result = engine.reserve(
      "PHONE-01",
      "buyer-b",
      6
    );

    expect(result).toMatchObject({
      success: false,
      code: "INSUFFICIENT_STOCK",
    });

    expect(engine.getProduct("PHONE-01")?.availableStock)
      .toBe(5);
  });

  it("rejects invalid reservation quantities", () => {
    const engine = createEngine();

    for (const quantity of [0, -1, 1.5, NaN]) {
      const result = engine.reserve(
        "PHONE-01",
        "buyer-c",
        quantity
      );

      expect(result).toMatchObject({
        success: false,
        code: "INVALID_QUANTITY",
      });
    }

    expect(engine.validateInvariants()).toBe(true);
  });

  it("rejects reservations for unknown products", () => {
    const engine = createEngine();

    expect(
      engine.reserve("UNKNOWN", "buyer-a", 1)
    ).toMatchObject({
      success: false,
      code: "PRODUCT_NOT_FOUND",
    });
  });

  it("returns stock after cancellation", () => {
    const engine = createEngine();

    const result = engine.reserve(
      "PHONE-01",
      "buyer-a",
      3
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    const cancelled = engine.cancel(result.data.id);

    expect(cancelled).toMatchObject({
      success: true,
      data: { status: "cancelled" },
    });

    expect(engine.getProduct("PHONE-01")).toMatchObject({
      availableStock: 5,
      reservedQuantity: 0,
      soldQuantity: 0,
      version: 2,
    });
  });

  it("prevents duplicate reservation cancellation", () => {
    const engine = createEngine();

    const result = engine.reserve(
      "PHONE-01",
      "buyer-a"
    );

    if (!result.success) {
      throw new Error("Expected successful reservation");
    }

    engine.cancel(result.data.id);

    expect(engine.cancel(result.data.id)).toMatchObject({
      success: false,
      code: "INVALID_TRANSITION",
    });

    expect(engine.getProduct("PHONE-01")?.availableStock)
      .toBe(5);

    expect(engine.validateInvariants()).toBe(true);
  });

  it("prevents overselling within a single engine", () => {
    const engine = createEngine();

    const results = Array.from(
      { length: 20 },
      (_, index) =>
        engine.reserve(
          "PHONE-01",
          `buyer-${index}`,
          1
        )
    );

    const successful = results.filter(
      (result) => result.success
    );

    const rejected = results.filter(
      (result) => !result.success
    );

    expect(successful).toHaveLength(5);
    expect(rejected).toHaveLength(15);

    expect(engine.getProduct("PHONE-01")).toMatchObject({
      availableStock: 0,
      reservedQuantity: 5,
      soldQuantity: 0,
    });

    expect(engine.validateInvariants()).toBe(true);
  });

  it("keeps the stock conservation invariant", () => {
    const engine = createEngine();

    const first = engine.reserve(
      "PHONE-01",
      "buyer-a",
      2
    );

    const second = engine.reserve(
      "PHONE-01",
      "buyer-b",
      1
    );

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);

    if (first.success) {
      engine.cancel(first.data.id);
    }

    const product = engine.getProduct("PHONE-01")!;

    expect(
      product.availableStock +
      product.reservedQuantity +
      product.soldQuantity
    ).toBe(product.initialStock);

    expect(engine.validateInvariants()).toBe(true);
  });

  it("rejects duplicate product identifiers", () => {
    expect(
      () => new InventoryEngine([PRODUCTS[0], PRODUCTS[0]])
    ).toThrow("Duplicate product ID");
  });

  it("does not expose mutable product references", () => {
    const engine = createEngine();

    const product = engine.getProduct("PHONE-01")!;
    product.availableStock = 999;

    const snapshot = engine.getSnapshot();
    snapshot.products[0].availableStock = 888;

    expect(engine.getProduct("PHONE-01")?.availableStock)
      .toBe(5);
  });

  it("records reservation and cancellation events", () => {
    const engine = createEngine();

    const reservation = engine.reserve(
      "PHONE-01",
      "buyer-a"
    );

    if (!reservation.success) {
      throw new Error("Expected successful reservation");
    }

    engine.cancel(reservation.data.id);

    const events = engine.getSnapshot().events;

    expect(events.map((event) => event.type)).toEqual([
      "RESERVED",
      "CANCELLED",
    ]);
  });
});


describe("FlashVault Reservation Lock Expiration", () => {
  function setupLockEngine() {
    let currentTime = 100_000;
    let sequence = 0;

    const engine = new InventoryEngine(
      [
        {
          id: "LOCK-01",
          name: "Flash Sale Product",
          originalPrice: 2000000,
          salePrice: 990000,
          initialStock: 5,
        },
      ],
      {
        now: () => currentTime,
        createId: () => `lock-${++sequence}`,
      }
    );

    return {
      engine,
      advanceBy(ms: number) {
        currentTime += ms;
      },
    };
  }

  it("keeps a reservation active before expiration", () => {
    const clock = setupLockEngine();

    const result = clock.engine.reserve(
      "LOCK-01",
      "buyer-a",
      2,
      30_000
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    clock.advanceBy(29_999);

    expect(
      clock.engine.isReservationActive(result.data.id)
    ).toBe(true);

    expect(
      clock.engine.getRemainingLockMs(result.data.id)
    ).toBe(1);

    expect(clock.engine.expireReservations()).toBe(0);
    expect(clock.engine.validateInvariants()).toBe(true);
  });

  it("expires a lock exactly at its deadline", () => {
    const clock = setupLockEngine();

    const result = clock.engine.reserve(
      "LOCK-01",
      "buyer-a",
      2,
      30_000
    );

    if (!result.success) {
      throw new Error("Reservation setup failed");
    }

    clock.advanceBy(30_000);

    expect(
      clock.engine.isReservationActive(result.data.id)
    ).toBe(false);

    expect(clock.engine.expireReservations()).toBe(1);

    expect(
      clock.engine.getReservation(result.data.id)?.status
    ).toBe("expired");

    expect(clock.engine.getProduct("LOCK-01")).toMatchObject({
      availableStock: 5,
      reservedQuantity: 0,
      soldQuantity: 0,
    });
  });

  it("does not release an expired lock twice", () => {
    const clock = setupLockEngine();

    const result = clock.engine.reserve(
      "LOCK-01",
      "buyer-a",
      3,
      1000
    );

    if (!result.success) {
      throw new Error("Reservation setup failed");
    }

    clock.advanceBy(1500);

    expect(clock.engine.expireReservations()).toBe(1);
    expect(clock.engine.expireReservations()).toBe(0);

    expect(clock.engine.getProduct("LOCK-01")).toMatchObject({
      availableStock: 5,
      reservedQuantity: 0,
      version: 2,
    });
  });

  it("reuses released stock in the next reservation", () => {
    const clock = setupLockEngine();

    const first = clock.engine.reserve(
      "LOCK-01",
      "buyer-a",
      5,
      1000
    );

    expect(first.success).toBe(true);

    clock.advanceBy(1001);

    // reserve() automatically sweeps expired locks.
    const second = clock.engine.reserve(
      "LOCK-01",
      "buyer-b",
      5,
      30_000
    );

    expect(second.success).toBe(true);

    expect(clock.engine.getProduct("LOCK-01")).toMatchObject({
      availableStock: 0,
      reservedQuantity: 5,
      soldQuantity: 0,
    });

    expect(clock.engine.validateInvariants()).toBe(true);
  });

  it("rejects cancellation after expiration", () => {
    const clock = setupLockEngine();

    const result = clock.engine.reserve(
      "LOCK-01",
      "buyer-a",
      1,
      1000
    );

    if (!result.success) {
      throw new Error("Reservation setup failed");
    }

    clock.advanceBy(2000);

    expect(clock.engine.cancel(result.data.id)).toMatchObject({
      success: false,
      code: "INVALID_TRANSITION",
    });

    expect(clock.engine.getProduct("LOCK-01")?.availableStock)
      .toBe(5);
  });

  it("does not expire already cancelled locks", () => {
    const clock = setupLockEngine();

    const result = clock.engine.reserve(
      "LOCK-01",
      "buyer-a",
      2,
      1000
    );

    if (!result.success) {
      throw new Error("Reservation setup failed");
    }

    clock.engine.cancel(result.data.id);
    clock.advanceBy(5000);

    expect(clock.engine.expireReservations()).toBe(0);
    expect(clock.engine.getProduct("LOCK-01")).toMatchObject({
      availableStock: 5,
      reservedQuantity: 0,
    });
  });

  it("expires multiple locks without violating stock balance", () => {
    const clock = setupLockEngine();

    clock.engine.reserve("LOCK-01", "buyer-a", 2, 1000);
    clock.engine.reserve("LOCK-01", "buyer-b", 2, 1000);

    clock.advanceBy(1000);

    expect(clock.engine.expireReservations()).toBe(2);

    expect(clock.engine.getProduct("LOCK-01")).toMatchObject({
      availableStock: 5,
      reservedQuantity: 0,
      soldQuantity: 0,
    });

    expect(clock.engine.validateInvariants()).toBe(true);
  });

  it("releases expired locks using the automatic monitor", async () => {
    const clock = setupLockEngine();

    vi.useFakeTimers();

    try {
      const result = clock.engine.reserve(
        "LOCK-01",
        "buyer-a",
        2,
        1000
      );

      expect(result.success).toBe(true);

      clock.engine.startExpiryMonitor(100);

      // Simulated business clock advances separately.
      clock.advanceBy(1000);

      await vi.advanceTimersByTimeAsync(100);

      expect(clock.engine.getProduct("LOCK-01")).toMatchObject({
        availableStock: 5,
        reservedQuantity: 0,
      });

      clock.engine.dispose();

      expect(vi.getTimerCount()).toBe(0);
    } finally {
      clock.engine.dispose();
      vi.useRealTimers();
    }
  });
});

