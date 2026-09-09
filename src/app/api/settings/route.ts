import { NextRequest, NextResponse } from "next/server";
import { readSettings, replaceSettings } from "@/lib/settings-store";
import {
  normalizeSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import { clientIp, isAdminAuthorized } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(
    { settings },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`admin-settings:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة، حاول بعد قليل" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { settings?: Partial<SiteSettings> };
    if (!body.settings || typeof body.settings !== "object") {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const settings = await replaceSettings(normalizeSettings(body.settings));
    return NextResponse.json(
      { settings },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "فشل حفظ الإعدادات" }, { status: 500 });
  }
}
