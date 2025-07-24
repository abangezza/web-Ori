// src/app/api/uploads/[...filename]/route.ts - IMPROVED FOR VPS
import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  const startTime = Date.now();

  try {
    // Join the filename array to handle nested paths
    const filename = params.filename.join("/");

    console.log(`🖼️ Image request for: ${filename}`);

    // Security: prevent path traversal attacks
    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("\\") ||
      filename.startsWith("/") ||
      filename.includes("//")
    ) {
      console.log(`❌ Invalid filename blocked: ${filename}`);
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Multiple possible paths for VPS deployment
    const possiblePaths = [
      path.join(process.cwd(), "public", "uploads", filename),
      path.join(process.cwd(), "uploads", filename),
      path.join("/var/www/html/public/uploads", filename), // Common VPS path
      path.join("/home/*/public_html/public/uploads", filename), // Alternative VPS path
    ];

    let filePath = null;
    let fileStats = null;

    // Try each possible path
    for (const testPath of possiblePaths) {
      if (existsSync(testPath)) {
        try {
          fileStats = await stat(testPath);
          if (fileStats.isFile()) {
            filePath = testPath;
            console.log(`✅ Found file at: ${testPath}`);
            break;
          }
        } catch (statError) {
          console.log(`⚠️ Could not stat file at ${testPath}:`, statError);
          continue;
        }
      }
    }

    // If file not found in any location
    if (!filePath || !fileStats) {
      console.log(`❌ File not found: ${filename}`);
      console.log(`Searched in:`, possiblePaths);

      // Return a placeholder image or 404
      return new NextResponse(null, {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Read the file
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(filePath);
      console.log(
        `📖 Successfully read file: ${filename} (${fileBuffer.length} bytes)`
      );
    } catch (readError) {
      console.error(`❌ Error reading file ${filename}:`, readError);
      return NextResponse.json(
        { error: "Error reading file" },
        { status: 500 }
      );
    }

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
      case ".bmp":
        contentType = "image/bmp";
        break;
      case ".ico":
        contentType = "image/x-icon";
        break;
      default:
        contentType = "image/jpeg"; // default fallback
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ Serving image: ${filename} (${contentType}) in ${processingTime}ms`
    );

    // Return the file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        ETag: `"${filename}-${fileStats.size}-${fileStats.mtime.getTime()}"`, // Better ETag
        "Last-Modified": fileStats.mtime.toUTCString(),
        "Accept-Ranges": "bytes",
        // CORS headers for VPS
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error serving file after ${processingTime}ms:`, error);

    return NextResponse.json(
      {
        error: "Internal server error",
        filename: params.filename.join("/"),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle HEAD requests for file existence checks
export async function HEAD(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join("/");

    // Security check
    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("\\") ||
      filename.startsWith("/")
    ) {
      return new NextResponse(null, { status: 400 });
    }

    // Check if file exists in any of the possible paths
    const possiblePaths = [
      path.join(process.cwd(), "public", "uploads", filename),
      path.join(process.cwd(), "uploads", filename),
      path.join("/var/www/html/public/uploads", filename),
    ];

    for (const testPath of possiblePaths) {
      if (existsSync(testPath)) {
        const fileStats = await stat(testPath);
        if (fileStats.isFile()) {
          return new NextResponse(null, {
            status: 200,
            headers: {
              "Content-Length": fileStats.size.toString(),
              "Last-Modified": fileStats.mtime.toUTCString(),
              ETag: `"${filename}-${
                fileStats.size
              }-${fileStats.mtime.getTime()}"`,
            },
          });
        }
      }
    }

    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error("Error in HEAD request:", error);
    return new NextResponse(null, { status: 500 });
  }
}
