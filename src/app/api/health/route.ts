// src/app/api/health/route.ts - Health Check API
import { NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: "unknown",
    checks: {} as any,
  };

  try {
    // 1. Environment Variables Check
    checks.checks.environment = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? "✓ Set" : "✗ Not set",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✓ Set" : "✗ Not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not set",
    };

    // 2. MongoDB Connection Check
    try {
      await connectMongo();
      checks.checks.mongodb = {
        status: "✓ Connected",
        message: "Database connection successful",
      };
    } catch (dbError) {
      checks.checks.mongodb = {
        status: "✗ Failed",
        error: String(dbError),
        message: "Database connection failed",
      };
    }

    // 3. File System Check
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    checks.checks.filesystem = {
      uploadsDir: uploadsDir,
      exists: existsSync(uploadsDir),
      writable: "Unknown", // We'll test this in a different way
    };

    // Test write permission
    try {
      const testFile = path.join(uploadsDir, "test-write.txt");
      const fs = require("fs").promises;
      await fs.writeFile(testFile, "test");
      await fs.unlink(testFile);
      checks.checks.filesystem.writable = "✓ Writable";
    } catch (writeError) {
      checks.checks.filesystem.writable = "✗ Not writable";
      checks.checks.filesystem.writeError = String(writeError);
    }

    // 4. Server Info
    checks.checks.server = {
      platform: process.platform,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cwd: process.cwd(),
    };

    // 5. Next.js Build Check
    const nextDir = path.join(process.cwd(), ".next");
    checks.checks.nextjs = {
      buildExists: existsSync(nextDir),
      buildPath: nextDir,
    };

    // Determine overall status
    const hasError = Object.values(checks.checks).some(
      (check: any) =>
        check.status?.includes("✗") ||
        check.exists === false ||
        check.writable?.includes("✗")
    );

    checks.status = hasError ? "error" : "healthy";

    return NextResponse.json(checks, {
      status: hasError ? 500 : 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    checks.status = "error";
    checks.checks.general = {
      status: "✗ Failed",
      error: String(error),
      message: "Health check failed",
    };

    return NextResponse.json(checks, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }
}
