import "server-only";
import type { Order } from "./types";

/** Public tracking payload — PII redacted. */
export type PublicOrder = Omit<
  Order,
  "customerName" | "phone" | "address" | "notes"
> & {
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  redacted: true;
};

export function maskName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "***";
  const parts = trimmed.split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return "*";
      return `${part[0]}${"*".repeat(Math.min(4, part.length - 1))}`;
    })
    .join(" ");
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

export function maskAddress(address: string) {
  const trimmed = address.trim();
  if (trimmed.length <= 4) return "***";
  return `${trimmed.slice(0, 2)}•••`;
}

export function toPublicOrder(order: Order): PublicOrder {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    storeId: order.storeId,
    storeName: order.storeName,
    customerName: maskName(order.customerName),
    phone: maskPhone(order.phone),
    village: order.village,
    address: maskAddress(order.address),
    notes: "",
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    redacted: true,
  };
}
