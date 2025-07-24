// src/app/api/uploads/[...filename]/route.ts - SIMPLIFIED VERSION
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    // Join filename parts
    const filename = params.filename.join("/");

    console.log(`🖼️ Image request: ${filename}`);

    // Basic security check
    if (!filename || filename.includes("..") || filename.includes("\\")) {
      console.log(`❌ Invalid filename: ${filename}`);
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Simple path resolution - just check the main uploads folder
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    console.log(`📁 Checking path: ${filePath}`);

    // Check if file exists
    if (!existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(filePath);
    console.log(
      `✅ File read successfully: ${filename} (${fileBuffer.length} bytes)`
    );

    // Get file extension for content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg"; // Default

    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
      // Default is jpeg
    }

    // Return file with basic headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400", // 24 hours cache
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error(`❌ Error serving file:`, error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle HEAD requests
export async function HEAD(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join("/");
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    if (existsSync(filePath)) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 404 });
    }
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
