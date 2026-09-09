import { promises as fs } from "fs";
import path from "path";
import type { Order, OrderStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

/** Serialize all order mutations so concurrent requests don't corrupt data */
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(ORDERS_FILE);
  } catch {
    await fs.writeFile(ORDERS_FILE, "[]", "utf8");
  }
}

async function readOrdersUnsafe(): Promise<Order[]> {
  await ensureFile();
  const raw = await fs.readFile(ORDERS_FILE, "utf8");
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeOrdersAtomic(orders: Order[]) {
  await ensureFile();
  const tmp = `${ORDERS_FILE}.${process.pid}.${Date.now()}.tmp`;
  const payload = JSON.stringify(orders);
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, ORDERS_FILE);
}

export async function readOrders(): Promise<Order[]> {
  return enqueue(() => readOrdersUnsafe());
}

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ZN-${stamp.slice(-5)}${rand}`;
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "status" | "paymentMethod">
): Promise<Order> {
  return enqueue(async () => {
    const orders = await readOrdersUnsafe();
    const order: Order = {
      ...input,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: "new",
      paymentMethod: "cash",
    };
    orders.unshift(order);
    // Keep file lean — last 2000 orders
    if (orders.length > 2000) orders.length = 2000;
    await writeOrdersAtomic(orders);
    return order;
  });
}

export async function getOrderById(id: string) {
  const orders = await readOrders();
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return enqueue(async () => {
    const orders = await readOrdersUnsafe();
    const index = orders.findIndex(
      (o) => o.id.toLowerCase() === id.toLowerCase()
    );
    if (index === -1) return null;
    orders[index] = { ...orders[index], status };
    await writeOrdersAtomic(orders);
    return orders[index];
  });
}
