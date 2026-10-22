
import type {
  InventoryDependencies,
  InventoryEvent,
  InventoryEventType,
  InventoryProduct,
  InventoryResult,
  InventorySnapshot,
  ProductInput,
  StockReservation,
} from "./inventory-types";

const DEFAULT_RESERVATION_MS = 30_000;

export class InventoryEngine {
  private products = new Map<string, InventoryProduct>();
  private reservations = new Map<string, StockReservation>();
  private events: InventoryEvent[] = [];

  private readonly now: () => number;
  private readonly createId: () => string;

  constructor(
    products: ProductInput[],
    dependencies: InventoryDependencies = {}
  ) {
    this.now = dependencies.now ?? (() => Date.now());
    this.createId =
      dependencies.createId ?? (() => crypto.randomUUID());

    for (const product of products) {
      if (!product.id.trim()) {
        throw new Error("Product ID cannot be empty");
      }

      if (this.products.has(product.id)) {
        throw new Error(`Duplicate product ID: ${product.id}`);
      }

      if (
        !Number.isSafeInteger(product.initialStock) ||
        product.initialStock < 0
      ) {
        throw new Error("Initial stock must be a non-negative integer");
      }

      if (
        !Number.isFinite(product.originalPrice) ||
        !Number.isFinite(product.salePrice) ||
        product.originalPrice < 0 ||
        product.salePrice < 0
      ) {
        throw new Error("Product prices must be non-negative");
      }

      this.products.set(product.id, {
        ...product,
        availableStock: product.initialStock,
        reservedQuantity: 0,
        soldQuantity: 0,
        version: 0,
      });
    }
  }

  // ----------------------------------------
  // Read-only public snapshots
  // ----------------------------------------

  getProduct(id: string): InventoryProduct | null {
    const product = this.products.get(id);
    return product ? { ...product } : null;
  }

  getReservation(id: string): StockReservation | null {
    const reservation = this.reservations.get(id);
    return reservation ? { ...reservation } : null;
  }

  getSnapshot(): InventorySnapshot {
    return {
      products: [...this.products.values()].map(
        (product) => ({ ...product })
      ),
      reservations: [...this.reservations.values()].map(
        (reservation) => ({ ...reservation })
      ),
      events: this.events.map((event) => ({ ...event })),
    };
  }

  // ----------------------------------------
  // Reservation transition
  // ----------------------------------------

  reserve(
    productId: string,
    buyerId: string,
    quantity = 1,
    durationMs = DEFAULT_RESERVATION_MS
  ): InventoryResult<StockReservation> {
    const product = this.products.get(productId);

    if (!product) {
      return {
        success: false,
        code: "PRODUCT_NOT_FOUND",
        message: "Product not found",
      };
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(durationMs) ||
      durationMs <= 0
    ) {
      this.log(
        "REJECTED",
        productId,
        "Invalid reservation quantity or duration"
      );

      return {
        success: false,
        code: "INVALID_QUANTITY",
        message: "Quantity and lock duration must be valid",
      };
    }

    if (product.availableStock < quantity) {
      this.log(
        "REJECTED",
        productId,
        `Insufficient stock for buyer ${buyerId}`
      );

      return {
        success: false,
        code: "INSUFFICIENT_STOCK",
        message: "Not enough available inventory",
      };
    }

    const timestamp = this.now();
    const reservation: StockReservation = {
      id: this.createId(),
      productId,
      buyerId,
      quantity,
      status: "reserved",
      createdAt: timestamp,
      expiresAt: timestamp + durationMs,
    };

    // All stock changes occur synchronously in one method.
    product.availableStock -= quantity;
    product.reservedQuantity += quantity;
    product.version++;

    this.reservations.set(reservation.id, reservation);

    this.log(
      "RESERVED",
      productId,
      `Buyer ${buyerId} reserved ${quantity} unit(s)`,
      reservation.id
    );

    this.assertStockInvariant(product);

    return {
      success: true,
      data: { ...reservation },
    };
  }

  // ----------------------------------------
  // Manual cancellation transition
  // ----------------------------------------

  cancel(
    reservationId: string
  ): InventoryResult<StockReservation> {
    const reservation = this.reservations.get(reservationId);

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
        code: "INVALID_TRANSITION",
        message: `Cannot cancel a ${reservation.status} reservation`,
      };
    }

    const product = this.products.get(reservation.productId);

    if (!product) {
      throw new Error("Inventory data is inconsistent");
    }

    reservation.status = "cancelled";

    product.reservedQuantity -= reservation.quantity;
    product.availableStock += reservation.quantity;
    product.version++;

    this.log(
      "CANCELLED",
      product.id,
      `Reservation ${reservationId} cancelled`,
      reservationId
    );

    this.assertStockInvariant(product);

    return {
      success: true,
      data: { ...reservation },
    };
  }

  // ----------------------------------------
  // Stock conservation validation
  // ----------------------------------------

  validateInvariants(): boolean {
    return [...this.products.values()].every(
      (product) =>
        this.isStockInvariantValid(product)
    );
  }

  private isStockInvariantValid(
    product: InventoryProduct
  ): boolean {
    return (
      product.availableStock >= 0 &&
      product.reservedQuantity >= 0 &&
      product.soldQuantity >= 0 &&
      product.initialStock ===
        product.availableStock +
        product.reservedQuantity +
        product.soldQuantity
    );
  }

  private assertStockInvariant(
    product: InventoryProduct
  ): void {
    if (!this.isStockInvariantValid(product)) {
      throw new Error(
        `Stock conservation invariant violated: ${product.id}`
      );
    }
  }

  // ----------------------------------------
  // Event logging
  // ----------------------------------------

  private log(
    type: InventoryEventType,
    productId: string,
    message: string,
    reservationId?: string
  ): void {
    this.events.push({
      id: this.createId(),
      type,
      productId,
      reservationId,
      message,
      timestamp: this.now(),
    });
  }
}
