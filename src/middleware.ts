import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isAdminHost(host: string) {
  const hostname = host.split(":")[0]?.toLowerCase() || "";
  return (
    hostname === "admin.localhost" ||
    hostname.startsWith("admin.")
  );
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (!isAdminHost(host)) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Static/API assets stay as-is on the admin host
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/serwist") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin/manifest.webmanifest") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    if (pathname === "/manifest.webmanifest") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/manifest.webmanifest";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // admin.example.com/  →  /admin
  // admin.example.com/foo → /admin (single-page admin app)
  const url = request.nextUrl.clone();
  url.pathname = "/admin";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
