import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const logged = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (pathname.startsWith("/espace-donateur") || pathname.startsWith("/account")) {
    if (!logged) {
      const u = new URL("/connexion", req.url);
      u.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(u);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!logged) {
      const u = new URL("/connexion", req.url);
      u.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(u);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/espace-donateur/:path*", "/account/:path*", "/admin/:path*"],
};
