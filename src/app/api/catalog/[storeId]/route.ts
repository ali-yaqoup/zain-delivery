import { NextRequest, NextResponse } from "next/server";
import { queryMutawaCatalog } from "@/lib/mutawa-catalog";
import { readSettings } from "@/lib/settings-store";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await context.params;
  if (storeId !== "mutawa" && storeId !== "mutawa-market") {
    return NextResponse.json({ error: "كتالوج غير موجود" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const settings = await readSettings();
  const includeHidden = searchParams.get("admin") === "1";

  const result = queryMutawaCatalog({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 24),
    overrides: settings.mutawaOverrides,
    includeHidden,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
