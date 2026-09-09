import { promises as fs } from "fs";
import path from "path";
import type { Order, OrderStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

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
  await fs.writeFile(tmp, JSON.stringify(orders), "utf8");
  await fs.rename(tmp, ORDERS_FILE);
}

export async function readOrdersFile(): Promise<Order[]> {
  return enqueue(() => readOrdersUnsafe());
}

export async function createOrderFile(
  order: Order
): Promise<Order> {
  return enqueue(async () => {
    const orders = await readOrdersUnsafe();
    orders.unshift(order);
    if (orders.length > 2000) orders.length = 2000;
    await writeOrdersAtomic(orders);
    return order;
  });
}

export async function getOrderByIdFile(id: string) {
  const orders = await readOrdersFile();
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
}

export async function updateOrderStatusFile(id: string, status: OrderStatus) {
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
