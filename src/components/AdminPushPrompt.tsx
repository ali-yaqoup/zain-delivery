"use client";

import { useCallback, useEffect, useState } from "react";
import { adminAuthHeaders } from "@/lib/admin-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function getRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  return navigator.serviceWorker.register("/serwist/sw.js", { scope: "/" });
}

export function AdminPushPrompt({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "on" | "off" | "denied" | "unsupported" | "error"
  >("idle");
  const [busy, setBusy] = useState(false);

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();

  const sync = useCallback(async () => {
    if (!vapid || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const reg = await getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    } catch {
      setStatus("off");
    }
  }, [vapid]);

  useEffect(() => {
    void sync();
  }, [sync]);

  async function enable() {
    if (!vapid) {
      setStatus("error");
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await getRegistration();
      if (!reg) throw new Error("no sw");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });

      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthHeaders(email, password),
        },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("on");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported") {
    return (
      <p className="rounded-xl border border-border bg-surface-2/40 px-3 py-2.5 text-xs text-muted">
        جهازك أو المتصفح ما بيدعم إشعارات التطبيق. على الآيفون لازم تثبّت «أدمن زين» على الشاشة وتفتحه من الأيقونة.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs text-danger">
        الإشعارات مرفوضة من إعدادات التلفون. اسمح فيها للمتصفح/التطبيق وجرّب مرة ثانية.
      </p>
    );
  }

  if (status === "on") {
    return (
      <p className="rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-xs text-success">
        الإشعارات شغّالة — رح يوصلك تنبيه على التلفون مع كل طلب جديد.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-brand/40 bg-brand/10 px-3 py-3">
      <p className="text-xs font-semibold text-ink">إشعارات الطلبات على التلفون</p>
      <p className="text-[11px] leading-relaxed text-muted">
        فعّلها مرة واحدة عشان يوصلك إشعار حتى لو التطبيق مسكّر. أفضل من أيقونة «أدمن زين» على الشاشة.
      </p>
      {status === "error" && (
        <p className="text-[11px] text-danger">ما قدرنا نفعّلها. تأكد إنك داخل ومن Chrome أو التطبيق المثبّت.</p>
      )}
      <button
        type="button"
        onClick={() => void enable()}
        disabled={busy}
        className="btn-press w-full rounded-xl bg-brand py-2 text-xs font-bold text-white disabled:opacity-60"
      >
        {busy ? "جارٍ التفعيل..." : "تفعيل إشعارات الأدمن"}
      </button>
    </div>
  );
}
