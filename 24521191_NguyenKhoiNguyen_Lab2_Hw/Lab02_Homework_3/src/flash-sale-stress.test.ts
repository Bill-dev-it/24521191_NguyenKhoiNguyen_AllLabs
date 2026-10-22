
import { describe, expect, it } from "vitest";
import { InventoryEngine } from "./inventory-engine";
import { CheckoutEngine } from "./checkout-engine";

function createTestSystem(initialStock = 5) {
  let clock = 100_000;
  let sequence = 0;

  const now = () => clock;
  const createId = () => `stress-${++sequence}`;

  const inventory = new InventoryEngine(
    [
      {
        id: "MEGA-11",
        name: "11.11 Limited Edition Deal",
        originalPrice: 10000000,
        salePrice: 4990000,
        initialStock,
      },
    ],
    { now, createId }
  );

  const checkout = new CheckoutEngine(inventory, {
    now,
    createId,
  });

  return {
    inventory,
    checkout,
    advance(ms: number) {
      clock += ms;
    },
    getNow: now,
  };
}

describe("FlashVault - Concurrency Stress & Race Audit", () => {
  it("handles 100 buyers competing for only 5 units", async () => {
    const { inventory, checkout } = createTestSystem(5);

    const result = await checkout.simulateBurst(
      "MEGA-11",
      100,
      1
    );

    expect(result.attempted).toBe(100);
    expect(result.successful).toBe(5);
    expect(result.rejected).toBe(95);

    expect(inventory.getProduct("MEGA-11")).toMatchObject({
      availableStock: 0,
      reservedQuantity: 5,
      soldQuantity: 0,
    });

    expect(inventory.validateInvariants()).toBe(true);
  });

  it("never oversells during repeated burst submissions", async () => {
    const { inventory, checkout } = createTestSystem(5);

    const bursts = await Promise.all([
      checkout.simulateBurst("MEGA-11", 20),
      checkout.simulateBurst("MEGA-11", 20),
      checkout.simulateBurst("MEGA-11", 20),
    ]);

    const totalSuccess = bursts.reduce(
      (sum, result) => sum + result.successful,
      0
    );

    expect(totalSuccess).toBe(5);
    expect(inventory.getProduct("MEGA-11")?.availableStock)
      .toBe(0);
    expect(inventory.validateInvariants()).toBe(true);
  });

  it("enforces the final-unit reservation boundary", async () => {
    const { inventory, checkout } = createTestSystem(1);

    const results = await checkout.simulateBurst(
      "MEGA-11",
      50
    );

    expect(results.successful).toBe(1);
    expect(results.rejected).toBe(49);

    expect(inventory.getProduct("MEGA-11")?.availableStock)
      .toBe(0);
  });

  it("rejects checkout exactly at the expiry deadline", () => {
    const system = createTestSystem();

    const reservation = system.inventory.reserve(
      "MEGA-11",
      "buyer-a",
      1,
      1000
    );

    if (!reservation.success) {
      throw new Error("Reservation setup failed");
    }

    system.advance(1000);

    const outcome = system.checkout.checkout(
      reservation.data.id
    );

    expect(outcome).toMatchObject({
      success: false,
      code: "RESERVATION_EXPIRED",
    });

    expect(system.inventory.getProduct("MEGA-11"))
      .toMatchObject({
        availableStock: 5,
        reservedQuantity: 0,
        soldQuantity: 0,
      });

    expect(system.inventory.validateInvariants()).toBe(true);
  });

  it("commits successfully just before expiry", () => {
    const system = createTestSystem();

    const reservation = system.inventory.reserve(
      "MEGA-11",
      "buyer-a",
      1,
      1000
    );

    if (!reservation.success) {
      throw new Error("Reservation setup failed");
    }

    system.advance(999);

    const outcome = system.checkout.checkout(
      reservation.data.id
    );

    expect(outcome.success).toBe(true);

    expect(system.inventory.getProduct("MEGA-11"))
      .toMatchObject({
        availableStock: 4,
        reservedQuantity: 0,
        soldQuantity: 1,
      });
  });

  it("does not duplicate orders after repeated checkout", async () => {
    const { inventory, checkout } = createTestSystem(1);

    const reservation = inventory.reserve(
      "MEGA-11",
      "buyer-a"
    );

    if (!reservation.success) {
      throw new Error("Reservation setup failed");
    }

    const results = await Promise.all(
      Array.from({ length: 20 }, async () => {
        await Promise.resolve();
        return checkout.checkout(reservation.data.id);
      })
    );

    expect(results.every((r) => r.success)).toBe(true);
    expect(checkout.getOrders()).toHaveLength(1);

    const orderIds = results.map((result) =>
      result.success ? result.data.id : ""
    );

    expect(new Set(orderIds).size).toBe(1);

    expect(inventory.getProduct("MEGA-11")).toMatchObject({
      availableStock: 0,
      reservedQuantity: 0,
      soldQuantity: 1,
    });
  });

  it("never releases stock after a successful checkout", () => {
    const system = createTestSystem();

    const reservation = system.inventory.reserve(
      "MEGA-11",
      "buyer-a",
      2,
      1000
    );

    if (!reservation.success) {
      throw new Error("Reservation setup failed");
    }

    expect(
      system.checkout.checkout(reservation.data.id).success
    ).toBe(true);

    system.advance(5000);

    expect(system.inventory.expireReservations()).toBe(0);

    expect(system.inventory.cancel(reservation.data.id))
      .toMatchObject({
        success: false,
        code: "INVALID_TRANSITION",
      });

    expect(system.inventory.getProduct("MEGA-11"))
      .toMatchObject({
        availableStock: 3,
        reservedQuantity: 0,
        soldQuantity: 2,
      });
  });

  it("restores stock once after cancellation and expiry", () => {
    const system = createTestSystem();

    const reservation = system.inventory.reserve(
      "MEGA-11",
      "buyer-a",
      3,
      1000
    );

    if (!reservation.success) {
      throw new Error("Reservation setup failed");
    }

    system.inventory.cancel(reservation.data.id);

    system.advance(2000);

    expect(system.inventory.expireReservations()).toBe(0);

    expect(system.inventory.getProduct("MEGA-11"))
      .toMatchObject({
        availableStock: 5,
        reservedQuantity: 0,
        soldQuantity: 0,
      });

    expect(system.inventory.validateInvariants()).toBe(true);
  });

  it("releases expired stock for a new buyer", () => {
    const system = createTestSystem(1);

    const first = system.inventory.reserve(
      "MEGA-11",
      "buyer-a",
      1,
      1000
    );

    expect(first.success).toBe(true);

    system.advance(1001);

    const second = system.inventory.reserve(
      "MEGA-11",
      "buyer-b",
      1,
      1000
    );

    expect(second.success).toBe(true);

    if (!second.success) return;

    expect(
      system.checkout.checkout(second.data.id).success
    ).toBe(true);

    expect(system.inventory.getProduct("MEGA-11"))
      .toMatchObject({
        availableStock: 0,
        reservedQuantity: 0,
        soldQuantity: 1,
      });
  });

  it("preserves inventory conservation after mixed operations", async () => {
    const system = createTestSystem(10);

    const burst = await system.checkout.simulateBurst(
      "MEGA-11",
      10
    );

    expect(burst.successful).toBe(10);

    const ids = burst.reservationIds;

    // Five successful checkouts.
    for (const id of ids.slice(0, 5)) {
      expect(system.checkout.checkout(id).success).toBe(true);
    }

    // Two cancellations.
    for (const id of ids.slice(5, 7)) {
      expect(system.inventory.cancel(id).success).toBe(true);
    }

    // Three reservations expire.
    system.advance(31_000);
    expect(system.inventory.expireReservations()).toBe(3);

    expect(system.inventory.getProduct("MEGA-11"))
      .toMatchObject({
        initialStock: 10,
        availableStock: 5,
        reservedQuantity: 0,
        soldQuantity: 5,
      });

    expect(system.inventory.validateInvariants()).toBe(true);
    expect(system.checkout.getOrders()).toHaveLength(5);
  });
});

