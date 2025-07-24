// src/app/api/uploads/[...filename]/route.ts - FIXED ARRAY ISSUE
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    // ✅ FIXED: Join the array into a single filename string
    const filename = Array.isArray(params.filename)
      ? params.filename.join("/")
      : params.filename;

    console.log(`🖼️ Image request: ${filename}`);
    console.log(`📥 Params received:`, params.filename);

    // Basic security check
    if (!filename || filename.includes("..") || filename.includes("\\")) {
      console.log(`❌ Invalid filename: ${filename}`);
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // ✅ FIXED: Ensure we pass a string to path.join
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    console.log(`📁 Checking path: ${filePath}`);

    // Check if file exists
    if (!existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return NextResponse.json(
        {
          error: "File not found",
          requestedFile: filename,
          fullPath: filePath,
        },
        { status: 404 }
      );
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
      case ".bmp":
        contentType = "image/bmp";
        break;
      // Default is jpeg for .jpg, .jpeg, and unknown extensions
    }

    // Return file with headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400", // 24 hours
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        ETag: `"${filename}-${fileBuffer.length}"`,
      },
    });
  } catch (error) {
    console.error(`❌ Error serving file:`, error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        requestedParams: params.filename,
      },
      { status: 500 }
    );
  }
}

// ✅ FIXED: Handle HEAD requests properly
export async function HEAD(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    // ✅ FIXED: Join array to string
    const filename = Array.isArray(params.filename)
      ? params.filename.join("/")
      : params.filename;

    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    if (existsSync(filePath)) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      return new NextResponse(null, { status: 404 });
    }
  } catch (error) {
    console.error("HEAD request error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
