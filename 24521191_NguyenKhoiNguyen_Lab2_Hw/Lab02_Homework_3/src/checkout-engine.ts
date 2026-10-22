
import { InventoryEngine } from "./inventory-engine";
import type {
  InventoryResult,
  StockReservation,
} from "./inventory-types";

export interface FlashSaleOrder {
  id: string;
  reservationId: string;
  productId: string;
  buyerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: "confirmed";
  createdAt: number;
}

export interface CheckoutDependencies {
  now?: () => number;
  createId?: () => string;
}

export interface BurstSimulationResult {
  attempted: number;
  successful: number;
  rejected: number;
  reservationIds: string[];
  errorCodes: string[];
}

export class CheckoutEngine {
  private readonly inventory: InventoryEngine;
  private readonly orders = new Map<string, FlashSaleOrder>();

  private readonly now: () => number;
  private readonly createId: () => string;

  constructor(
    inventory: InventoryEngine,
    dependencies: CheckoutDependencies = {}
  ) {
    this.inventory = inventory;
    this.now = dependencies.now ?? (() => Date.now());
    this.createId =
      dependencies.createId ?? (() => crypto.randomUUID());
  }

  /**
   * Checkout is idempotent for the same reservation ID.
   * Repeated calls return the same confirmed order.
   */
  checkout(
    reservationId: string
  ): InventoryResult<FlashSaleOrder> {
    const existingOrder = this.orders.get(reservationId);

    if (existingOrder) {
      return {
        success: true,
        data: { ...existingOrder },
      };
    }

    const reservation =
      this.inventory.getReservation(reservationId);

    if (!reservation) {
      return {
        success: false,
        code: "RESERVATION_NOT_FOUND",
        message: "Reservation not found",
      };
    }

    if (reservation.status !== "reserved") {
      return {
        success: false,
        code: reservation.status === "expired"
          ? "RESERVATION_EXPIRED"
          : "INVALID_TRANSITION",
        message: `Reservation is ${reservation.status}`,
      };
    }

    const product = this.inventory.getProduct(
      reservation.productId
    );

    if (!product) {
      return {
        success: false,
        code: "PRODUCT_NOT_FOUND",
        message: "Product no longer exists",
      };
    }

    // InventoryEngine remains the only stock authority.
    const committed =
      this.inventory.commitReservation(reservationId);

    if (!committed.success) {
      return committed;
    }

    const order: FlashSaleOrder = {
      id: this.createId(),
      reservationId: committed.data.id,
      productId: committed.data.productId,
      buyerId: committed.data.buyerId,
      quantity: committed.data.quantity,
      unitPrice: product.salePrice,
      totalPrice:
        product.salePrice * committed.data.quantity,
      status: "confirmed",
      createdAt: this.now(),
    };

    this.orders.set(reservationId, order);

    return {
      success: true,
      data: { ...order },
    };
  }

  getOrder(
    reservationId: string
  ): FlashSaleOrder | null {
    const order = this.orders.get(reservationId);

    return order ? { ...order } : null;
  }

  getOrders(): FlashSaleOrder[] {
    return [...this.orders.values()].map(
      (order) => ({ ...order })
    );
  }

  getTotalRevenue(): number {
    return [...this.orders.values()].reduce(
      (total, order) => total + order.totalPrice,
      0
    );
  }

  /**
   * Simulates multiple buyers competing for stock.
   *
   * All requests share one authoritative in-memory engine.
   * This is not distributed concurrency.
   */
  async simulateBurst(
    productId: string,
    buyerCount: number,
    quantityPerBuyer = 1
  ): Promise<BurstSimulationResult> {
    if (
      !Number.isSafeInteger(buyerCount) ||
      buyerCount < 0
    ) {
      throw new RangeError("Invalid buyer count");
    }

    const requests = Array.from(
      { length: buyerCount },
      (_, index) => ({
        buyerId: `burst-buyer-${index + 1}`,
      })
    );

    const results = await Promise.all(
      requests.map(async ({ buyerId }) => {
        // Yield to a microtask to simulate competing submissions.
        await Promise.resolve();

        return this.inventory.reserve(
          productId,
          buyerId,
          quantityPerBuyer
        );
      })
    );

    const successes = results.filter(
      (result): result is {
        success: true;
        data: StockReservation;
      } => result.success
    );

    const failures = results.filter(
      (result): result is Extract<
        InventoryResult<StockReservation>,
        { success: false }
      > => !result.success
    );

    return {
      attempted: buyerCount,
      successful: successes.length,
      rejected: failures.length,
      reservationIds: successes.map(
        (result) => result.data.id
      ),
      errorCodes: failures.map(
        (result) => result.code
      ),
    };
  }
}
