import { NextRequest, NextResponse } from "next/server";
import { clientIp, isAdminAuthorized } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  deletePushSubscription,
  savePushSubscription,
} from "@/lib/push-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`admin-push:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة، حاول بعد قليل" },
      { status: 429 }
    );
  }

  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()) {
    return NextResponse.json(
      { error: "الإشعارات غير مفعّلة على السيرفر" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    await savePushSubscription({
      endpoint: String(body.endpoint).slice(0, 2000),
      keys: {
        p256dh: String(body.keys.p256dh).slice(0, 200),
        auth: String(body.keys.auth).slice(0, 200),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "فشل حفظ الاشتراك" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { endpoint?: string };
    if (body.endpoint) await deletePushSubscription(body.endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "فشل الإلغاء" }, { status: 500 });
  }
}
