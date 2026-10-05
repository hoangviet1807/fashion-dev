import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  if (request.auth?.user) return;
  const login = new URL("/login", request.nextUrl);
  login.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
});

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
