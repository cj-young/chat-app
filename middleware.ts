import { NextRequest, NextResponse } from "next/server";
import { AuthStatus } from "./types/auth";

import "server-only";

export const runtime = "nodejs";

const unauthRoutes = new Set(["/login", "/signup"]);
const authRoutes = new Set(["/"]);

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/_next")) return NextResponse.next();

  let authStatus: AuthStatus;
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/auth/status/${
        req.cookies.get("session")?.value
      }`
    );

    const data = await response.json();
    if (!response.ok) {
      authStatus = "unauthenticated";
    }

    authStatus = data.authStatus;
  } catch (error) {
    authStatus = "unauthenticated";
  }

  const page = getPageName(req.nextUrl.pathname);

  if (
    (authStatus === "unauthenticated" || authStatus === "signingUp") &&
    authRoutes.has(page)
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (authStatus === "authenticated" && unauthRoutes.has(page)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

function getPageName(path: string) {
  let i = 1;
  while (i < path.length && path[i] !== "/" && path[1] !== "?") {
    i++;
  }

  return path.slice(0, i + 1);
}
