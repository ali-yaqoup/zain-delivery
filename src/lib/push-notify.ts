import "server-only";
import webpush from "web-push";
import type { Order } from "./types";
import {
  deletePushSubscription,
  listPushSubscriptions,
} from "./push-store";

function vapidReady() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:admin@localhost";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export async function notifyAdminsNewOrder(order: Order) {
  const vapid = vapidReady();
  if (!vapid) return;

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const payload = JSON.stringify({
    title: "طلب جديد — زين دليفري",
    body: `${order.storeName} — ${order.village} — ${order.total}₪`,
    url: "/admin",
    tag: `order-${order.id}`,
  });

  const subs = await listPushSubscriptions();
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload, { TTL: 60 * 60 });
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await deletePushSubscription(sub.endpoint);
        }
      }
    })
  );
}
