import "server-only";
import type { CartLine, Order, OrderStatus } from "./types";
import { getSql, hasDatabase } from "./db";
import { newOrderId } from "./admin-auth";
import {
  createOrderFile,
  getOrderByIdFile,
  readOrdersFile,
  updateOrderStatusFile,
} from "./orders-store-file";

type OrderRow = {
  id: string;
  created_at: Date | string;
  status: OrderStatus;
  store_id: string;
  store_name: string;
  customer_name: string;
  phone: string;
  village: string;
  address: string;
  notes: string;
  items: CartLine[] | string;
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  payment_method: "cash";
};

function rowToOrder(row: OrderRow): Order {
  const items =
    typeof row.items === "string"
      ? (JSON.parse(row.items) as CartLine[])
      : row.items;
  return {
    id: row.id,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    status: row.status,
    storeId: row.store_id,
    storeName: row.store_name,
    customerName: row.customer_name,
    phone: row.phone,
    village: row.village,
    address: row.address,
    notes: row.notes ?? "",
    items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    paymentMethod: "cash",
  };
}

export async function readOrders(): Promise<Order[]> {
  if (!hasDatabase()) return readOrdersFile();

  const sql = getSql();
  const rows = await sql<OrderRow[]>`
    SELECT
      id, created_at, status, store_id, store_name,
      customer_name, phone, village, address, notes,
      items, subtotal, delivery_fee, total, payment_method
    FROM orders
    ORDER BY created_at DESC
    LIMIT 2000
  `;
  return rows.map(rowToOrder);
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "status" | "paymentMethod">
): Promise<Order> {
  const order: Order = {
    ...input,
    id: newOrderId(),
    createdAt: new Date().toISOString(),
    status: "new",
    paymentMethod: "cash",
  };

  if (!hasDatabase()) return createOrderFile(order);

  const sql = getSql();
  const rows = await sql<OrderRow[]>`
    INSERT INTO orders (
      id, created_at, status, store_id, store_name,
      customer_name, phone, village, address, notes,
      items, subtotal, delivery_fee, total, payment_method
    ) VALUES (
      ${order.id},
      ${order.createdAt},
      ${order.status},
      ${order.storeId},
      ${order.storeName},
      ${order.customerName},
      ${order.phone},
      ${order.village},
      ${order.address},
      ${order.notes},
      ${sql.json(order.items)},
      ${order.subtotal},
      ${order.deliveryFee},
      ${order.total},
      ${order.paymentMethod}
    )
    RETURNING
      id, created_at, status, store_id, store_name,
      customer_name, phone, village, address, notes,
      items, subtotal, delivery_fee, total, payment_method
  `;
  return rowToOrder(rows[0]);
}

export async function getOrderById(id: string) {
  if (!hasDatabase()) return getOrderByIdFile(id);

  const sql = getSql();
  const rows = await sql<OrderRow[]>`
    SELECT
      id, created_at, status, store_id, store_name,
      customer_name, phone, village, address, notes,
      items, subtotal, delivery_fee, total, payment_method
    FROM orders
    WHERE lower(id) = lower(${id})
    LIMIT 1
  `;
  return rows[0] ? rowToOrder(rows[0]) : undefined;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!hasDatabase()) return updateOrderStatusFile(id, status);

  const sql = getSql();
  const rows = await sql<OrderRow[]>`
    UPDATE orders
    SET status = ${status}
    WHERE lower(id) = lower(${id})
    RETURNING
      id, created_at, status, store_id, store_name,
      customer_name, phone, village, address, notes,
      items, subtotal, delivery_fee, total, payment_method
  `;
  return rows[0] ? rowToOrder(rows[0]) : null;
}
