
/**
 * FlashVault - Inventory Domain Contracts
 * HW3 / Stage 3
 */

export type ReservationStatus =
  | "reserved"
  | "committed"
  | "expired"
  | "cancelled";

export interface ProductInput {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  initialStock: number;
}

export interface InventoryProduct extends ProductInput {
  availableStock: number;
  reservedQuantity: number;
  soldQuantity: number;
  version: number;
}

export interface StockReservation {
  id: string;
  productId: string;
  buyerId: string;
  quantity: number;
  status: ReservationStatus;
  createdAt: number;
  expiresAt: number;
}

export type InventoryEventType =
  | "RESERVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "COMMITTED";

export interface InventoryEvent {
  id: string;
  type: InventoryEventType;
  productId: string;
  reservationId?: string;
  message: string;
  timestamp: number;
}

export type InventoryErrorCode =
  | "PRODUCT_NOT_FOUND"
  | "INVALID_QUANTITY"
  | "INSUFFICIENT_STOCK"
  | "RESERVATION_NOT_FOUND"
  | "RESERVATION_EXPIRED"
  | "INVALID_TRANSITION";

export type InventoryResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      code: InventoryErrorCode;
      message: string;
    };

export interface InventorySnapshot {
  products: InventoryProduct[];
  reservations: StockReservation[];
  events: InventoryEvent[];
}

export interface InventoryDependencies {
  now?: () => number;
  createId?: () => string;
}
