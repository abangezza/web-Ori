// src/middleware.ts - Enhanced middleware with debugging
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("🛡️ Middleware processing:", {
      method: req.method,
      pathname: req.nextUrl.pathname,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get("user-agent")?.substring(0, 100),
      contentType: req.headers.get("content-type"),
    });

    // Skip middleware for API routes that don't need auth
    if (
      req.nextUrl.pathname.startsWith("/api/") &&
      !req.nextUrl.pathname.startsWith("/api/mobil") &&
      !req.nextUrl.pathname.startsWith("/api/dashboard")
    ) {
      console.log("⏭️ Skipping auth for API route:", req.nextUrl.pathname);
      return NextResponse.next();
    }

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;
    const processingTime = Date.now() - startTime;

    console.log("🔍 Auth check result:", {
      path: pathname,
      hasToken: !!token,
      tokenExists: token ? "✅" : "❌",
      processingTime: `${processingTime}ms`,
    });

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      if (!token) {
        console.log("🚫 No token found, redirecting to login:", {
          requestedPath: pathname,
          redirectTo: "/login",
        });

        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
      } else {
        console.log("✅ Token validated, allowing access:", {
          path: pathname,
          userRole: token.role,
          userId: token.id,
        });
      }
    }

    const totalTime = Date.now() - startTime;
    console.log("✅ Middleware completed:", {
      path: pathname,
      totalTime: `${totalTime}ms`,
      action: isProtectedRoute ? (token ? "allowed" : "redirected") : "passed",
    });

    return NextResponse.next();
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("❌ Middleware error:", {
      path: req.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
      totalTime: `${totalTime}ms`,
    });

    // In case of error, allow the request to continue
    // but log the error for debugging
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes that don't need auth
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
