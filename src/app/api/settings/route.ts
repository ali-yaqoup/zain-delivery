import { NextRequest, NextResponse } from "next/server";
import { readSettings, replaceSettings } from "@/lib/settings-store";
import {
  normalizeSettings,
  type SiteSettings,
} from "@/lib/site-settings";

export const runtime = "nodejs";

function isAdmin(request: NextRequest) {
  const auth = request.headers.get("x-admin-key");
  return auth === process.env.ADMIN_PASSWORD || auth === "zain2026";
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(
    { settings },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
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
