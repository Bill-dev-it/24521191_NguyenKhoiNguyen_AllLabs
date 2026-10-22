
import type { ProductInput } from "./inventory-types";

export interface FlashProduct extends ProductInput {
  category: string;
  emoji: string;
  badge: string;
  description: string;
}

export const FLASH_PRODUCTS: FlashProduct[] = [
  {
    id: "FV-PHONE-01",
    name: "Galaxy S25 Ultra",
    category: "Smartphones",
    emoji: "📱",
    badge: "HOT DEAL",
    description: "Flagship smartphone · 256GB",
    originalPrice: 33990000,
    salePrice: 22990000,
    initialStock: 5,
  },
  {
    id: "FV-LAPTOP-02",
    name: "ASUS Vivobook 15",
    category: "Laptops",
    emoji: "💻",
    badge: "11.11 SPECIAL",
    description: "Productivity laptop · 16GB RAM",
    originalPrice: 18990000,
    salePrice: 12990000,
    initialStock: 8,
  },
  {
    id: "FV-AUDIO-03",
    name: "Sony WH-1000XM5",
    category: "Audio",
    emoji: "🎧",
    badge: "LIMITED STOCK",
    description: "Wireless noise-cancelling headphones",
    originalPrice: 8990000,
    salePrice: 5990000,
    initialStock: 12,
  },
  {
    id: "FV-WATCH-04",
    name: "Galaxy Watch 7",
    category: "Wearables",
    emoji: "⌚",
    badge: "FLASH PRICE",
    description: "Smartwatch · Health & fitness",
    originalPrice: 7990000,
    salePrice: 4490000,
    initialStock: 10,
  },
  {
    id: "FV-MOUSE-05",
    name: "Logitech MX Master 3S",
    category: "Accessories",
    emoji: "🖱️",
    badge: "TOP PICK",
    description: "Wireless productivity mouse",
    originalPrice: 2990000,
    salePrice: 1690000,
    initialStock: 15,
  },
  {
    id: "FV-TABLET-06",
    name: "iPad Air 11-inch",
    category: "Tablets",
    emoji: "📲",
    badge: "MEGA DISCOUNT",
    description: "Creative tablet · Wi-Fi",
    originalPrice: 16990000,
    salePrice: 11990000,
    initialStock: 6,
  },
];

export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPercent(
  original: number,
  sale: number
): number {
  if (original <= 0) return 0;

  return Math.round(
    ((original - sale) / original) * 100
  );
}
