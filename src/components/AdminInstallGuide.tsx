"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios = "standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone);
  return mq || ios;
}

export function AdminInstallGuide() {
  const [standalone, setStandalone] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [host, setHost] = useState("");

  useEffect(() => {
    setStandalone(isStandalone());
    setHost(window.location.host);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setCanPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const adminHostSuggested = host
    ? `admin.${host.replace(/^www\./, "").split(":")[0]}`
    : "admin.zaindelivery.shop";

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setCanPrompt(false);
  }

  if (standalone) {
    return (
      <p className="rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-xs text-success">
        التطبيق مفتوح كـ PWA للأدمن — تمام.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-border/80 bg-surface-2/40 px-3 py-2.5 text-xs text-muted">
      <p className="font-semibold text-ink">تثبيت اختصار الأدمن (منفصل عن الزبائن)</p>
      <ol className="list-decimal space-y-1 pe-4 text-[11px] leading-relaxed">
        <li>
          مهم: افتح هذه الصفحة من <span className="text-ink">المتصفح</span>،
          مش من داخل تطبيق «زين دليفري».
        </li>
        <li>
          أندرويد Chrome: القائمة ⋮ ← <span className="text-ink">تثبيت التطبيق</span> أو
          «إضافة إلى الشاشة الرئيسية» — لازم يظهر الاسم <span className="text-ink">أدمن زين</span>.
        </li>
        <li>
          آيفون: من <span className="text-ink">Safari</span> فقط ← مشاركة ← إضافة إلى
          الشاشة الرئيسية.
        </li>
      </ol>
      {canPrompt && (
        <button
          type="button"
          onClick={install}
          className="btn-press w-full rounded-xl bg-brand py-2 text-xs font-bold text-white"
        >
          تثبيت أدمن زين الآن
        </button>
      )}
      <p className="text-[11px] leading-relaxed text-soft">
        الأفضل لاحقاً: ربط نطاق فرعي{" "}
        <span className="font-mono text-ink" dir="ltr">
          {adminHostSuggested}
        </span>{" "}
        عشان التثبيت يفصل ١٠٠٪ عن تطبيق الزبائن.
      </p>
    </div>
  );
}
