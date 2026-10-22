
import { describe, expect, it } from "vitest";
import { InventoryEngine } from "./inventory-engine";
import { CheckoutEngine } from "./checkout-engine";

function setup(stock = 5) {
  let currentTime = 100_000;
  let sequence = 0;

  const now = () => currentTime;
  const createId = () => `id-${++sequence}`;

  const inventory = new InventoryEngine(
    [
      {
        id: "FLASH-01",
        name: "11.11 Flash Smartphone",
        originalPrice: 12000000,
        salePrice: 6990000,
        initialStock: stock,
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
    advanceBy(ms: number) {
      currentTime += ms;
    },
  };
}

describe("FlashVault Checkout Engine", () => {
  it("confirms a valid reservation", () => {
    const { inventory, checkout } = setup();

    const reservation = inventory.reserve(
      "FLASH-01", "buyer-a", 2
    );

    if (!reservation.success) {
      throw new Error("Expected reservation success");
    }

    const result = checkout.checkout(reservation.data.id);

    expect(result).toMatchObject({
      success: true,
      data: {
        productId: "FLASH-01",
        quantity: 2,
        status: "confirmed",
        totalPrice: 13980000,
      },
    });

    expect(inventory.getProduct("FLASH-01")).toMatchObject({
      availableStock: 3,
      reservedQuantity: 0,
      soldQuantity: 2,
    });
  });

  it("does not deduct available stock twice", () => {
    const { inventory, checkout } = setup();

    const reservation = inventory.reserve(
      "FLASH-01", "buyer-a", 3
    );

    if (!reservation.success) throw new Error("Setup failed");

    expect(inventory.getProduct("FLASH-01")?.availableStock)
      .toBe(2);

    checkout.checkout(reservation.data.id);

    expect(inventory.getProduct("FLASH-01")).toMatchObject({
      availableStock: 2,
      reservedQuantity: 0,
      soldQuantity: 3,
    });

    expect(inventory.validateInvariants()).toBe(true);
  });

  it("returns the same order on repeated checkout", () => {
    const { inventory, checkout } = setup();

    const reservation = inventory.reserve(
      "FLASH-01", "buyer-a"
    );

    if (!reservation.success) throw new Error("Setup failed");

    const first = checkout.checkout(reservation.data.id);
    const second = checkout.checkout(reservation.data.id);

    expect(first.success).toBe(true);
    expect(second).toEqual(first);
    expect(checkout.getOrders()).toHaveLength(1);

    expect(inventory.getProduct("FLASH-01")?.soldQuantity)
      .toBe(1);
  });

  it("rejects checkout after reservation expiration", () => {
    const context = setup();

    const reservation = context.inventory.reserve(
      "FLASH-01", "buyer-a", 1, 1000
    );

    if (!reservation.success) throw new Error("Setup failed");

    context.advanceBy(1001);

    expect(
      context.checkout.checkout(reservation.data.id)
    ).toMatchObject({
      success: false,
      code: "RESERVATION_EXPIRED",
    });

    expect(
      context.inventory.getProduct("FLASH-01")
    ).toMatchObject({
      availableStock: 5,
      reservedQuantity: 0,
      soldQuantity: 0,
    });
  });

  it("rejects checkout of cancelled reservations", () => {
    const { inventory, checkout } = setup();

    const reservation = inventory.reserve(
      "FLASH-01", "buyer-a"
    );

    if (!reservation.success) throw new Error("Setup failed");

    inventory.cancel(reservation.data.id);

    expect(checkout.checkout(reservation.data.id))
      .toMatchObject({
        success: false,
        code: "INVALID_TRANSITION",
      });
  });

  it("rejects unknown reservation identifiers", () => {
    const { checkout } = setup();

    expect(checkout.checkout("missing-id"))
      .toMatchObject({
        success: false,
        code: "RESERVATION_NOT_FOUND",
      });
  });

  it("prevents overselling when 20 buyers compete for 5 units", async () => {
    const { inventory, checkout } = setup(5);

    const result = await checkout.simulateBurst(
      "FLASH-01", 20, 1
    );

    expect(result).toMatchObject({
      attempted: 20,
      successful: 5,
      rejected: 15,
    });

    expect(result.reservationIds).toHaveLength(5);
    expect(inventory.validateInvariants()).toBe(true);

    expect(inventory.getProduct("FLASH-01")).toMatchObject({
      availableStock: 0,
      reservedQuantity: 5,
      soldQuantity: 0,
    });
  });

  it("allows only one buyer to reserve the last unit", async () => {
    const { inventory, checkout } = setup(1);

    const result = await checkout.simulateBurst(
      "FLASH-01", 10, 1
    );

    expect(result.successful).toBe(1);
    expect(result.rejected).toBe(9);

    expect(inventory.getProduct("FLASH-01")?.availableStock)
      .toBe(0);
  });

  it("calculates revenue only for confirmed orders", () => {
    const { inventory, checkout } = setup();

    const first = inventory.reserve(
      "FLASH-01", "buyer-a", 2
    );

    const second = inventory.reserve(
      "FLASH-01", "buyer-b", 1
    );

    if (!first.success || !second.success) {
      throw new Error("Setup failed");
    }

    checkout.checkout(first.data.id);

    expect(checkout.getTotalRevenue())
      .toBe(13980000);

    checkout.checkout(second.data.id);

    expect(checkout.getTotalRevenue())
      .toBe(20970000);
  });

  it("preserves inventory after multiple confirmed orders", async () => {
    const { inventory, checkout } = setup(5);

    const burst = await checkout.simulateBurst(
      "FLASH-01", 20
    );

    for (const id of burst.reservationIds) {
      expect(checkout.checkout(id).success).toBe(true);
    }

    expect(inventory.getProduct("FLASH-01")).toMatchObject({
      availableStock: 0,
      reservedQuantity: 0,
      soldQuantity: 5,
    });

    expect(checkout.getOrders()).toHaveLength(5);
    expect(inventory.validateInvariants()).toBe(true);
  });
});
