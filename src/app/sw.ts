/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  let title = "طلب جديد — زين دليفري";
  let body = "في طلب جديد بانتظارك";
  let url = "/admin";
  let tag = "zain-order";

  try {
    const data = event.data?.json() as {
      title?: string;
      body?: string;
      url?: string;
      tag?: string;
    };
    if (data.title) title = data.title;
    if (data.body) body = data.body;
    if (data.url) url = data.url;
    if (data.tag) tag = data.tag;
  } catch {
    const text = event.data?.text();
    if (text) body = text;
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
      tag,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target =
    (event.notification.data as { url?: string } | undefined)?.url || "/admin";
  event.waitUntil(self.clients.openWindow(target));
});
