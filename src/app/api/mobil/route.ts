// src/app/api/mobil/route.ts - IMPROVED VERSION WITH BETTER ERROR HANDLING
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import { writeFile, mkdir } from "fs/promises";
import { unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

// Debugging helper
function logDebug(message: string, data?: any) {
  console.log(`[DEBUG ${new Date().toISOString()}] ${message}`, data || "");
}

function logError(message: string, error?: any) {
  console.error(`[ERROR ${new Date().toISOString()}] ${message}`, error || "");
}

// POST: Tambah mobil baru
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    logDebug("=== POST /api/mobil started ===");
    logDebug("Environment check:", {
      nodeEnv: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? "✓ Set" : "✗ Not set",
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? "✓ Set" : "✗ Not set",
    });

    // Test database connection first
    try {
      logDebug("Attempting MongoDB connection...");
      await connectMongo();
      logDebug("✓ MongoDB connected successfully");
    } catch (dbError) {
      logError("✗ MongoDB connection failed:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error:
            process.env.NODE_ENV === "development"
              ? String(dbError)
              : "Database connection error",
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse form data with error handling
    let formData: FormData;
    let fields: Record<string, any>;
    let files: File[];

    try {
      logDebug("Parsing form data...");
      formData = await request.formData();
      fields = Object.fromEntries(formData.entries());
      files = formData.getAll("fotos") as File[];

      logDebug("✓ Form data parsed", {
        fieldCount: Object.keys(fields).length,
        fileCount: files.length,
        fields: Object.keys(fields),
      });
    } catch (parseError) {
      logError("✗ Form data parsing failed:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to parse form data",
          error:
            process.env.NODE_ENV === "development"
              ? String(parseError)
              : "Invalid form data",
          timestamp: new Date().toISOString(),
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate required fields
    const requiredFields = [
      "merek",
      "tipe",
      "tahun",
      "warna",
      "bahan_bakar",
      "transmisi",
      "kapasitas_mesin",
      "kilometer",
      "noPol",
      "noRangka",
      "noMesin",
      "pajak",
      "harga",
      "dp",
      "angsuran_4_thn",
      "angsuran_5_tahun",
      "STNK",
      "BPKB",
      "Faktur",
      "deskripsi",
      "status",
    ];

    const missingFields = requiredFields.filter(
      (field) => !fields[field] || String(fields[field]).trim() === ""
    );

    if (missingFields.length > 0) {
      logError("✗ Missing required fields:", missingFields);
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
          timestamp: new Date().toISOString(),
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate files
    if (!files || files.length < 6 || files.length > 10) {
      logError("✗ File validation failed", { fileCount: files?.length || 0 });
      return NextResponse.json(
        {
          success: false,
          message: "Wajib upload minimal 6 foto dan maksimal 10 foto",
          receivedFiles: files?.length || 0,
          timestamp: new Date().toISOString(),
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate file types and sizes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        logError(`✗ File ${i + 1} is not an image:`, file.type);
        return NextResponse.json(
          {
            success: false,
            message: `File ${i + 1} bukan gambar: ${file.type}`,
            fileType: file.type,
            timestamp: new Date().toISOString(),
          },
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        logError(
          `✗ File ${i + 1} too large:`,
          `${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
        return NextResponse.json(
          {
            success: false,
            message: `File ${i + 1} terlalu besar: ${(
              file.size /
              1024 /
              1024
            ).toFixed(2)}MB`,
            maxSize: "5MB",
            timestamp: new Date().toISOString(),
          },
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Create uploads directory with proper error handling
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    logDebug("Uploads directory path:", uploadsDir);

    try {
      if (!existsSync(uploadsDir)) {
        logDebug("Creating uploads directory...");
        await mkdir(uploadsDir, { recursive: true });
        logDebug("✓ Created uploads directory");
      } else {
        logDebug("✓ Uploads directory exists");
      }
    } catch (dirError) {
      logError("✗ Failed to create uploads directory:", dirError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create uploads directory",
          error:
            process.env.NODE_ENV === "development"
              ? String(dirError)
              : "File system error",
          path: uploadsDir,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Save files with individual error handling
    const savedFileNames: string[] = [];
    logDebug("Starting file upload process...");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        logDebug(`Processing file ${i + 1}/${files.length}:`, {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          type: file.type,
        });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        await writeFile(filePath, buffer);
        savedFileNames.push(fileName);

        logDebug(`✓ Saved file ${i + 1}:`, fileName);
      } catch (fileError) {
        logError(`✗ Error saving file ${i + 1}:`, fileError);

        // Clean up any successfully saved files
        for (const savedFile of savedFileNames) {
          try {
            await unlink(path.join(uploadsDir, savedFile));
            logDebug("Cleaned up file:", savedFile);
          } catch (cleanupError) {
            logError("Cleanup error:", cleanupError);
          }
        }

        return NextResponse.json(
          {
            success: false,
            message: `Failed to save file ${i + 1}: ${file.name}`,
            error:
              process.env.NODE_ENV === "development"
                ? String(fileError)
                : "File save error",
            timestamp: new Date().toISOString(),
          },
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    logDebug("✓ All files uploaded successfully");

    // Prepare data for database with type conversion
    let mobilData: any;

    try {
      logDebug("Preparing data for database...");
      mobilData = {
        merek: String(fields.merek).trim(),
        tipe: String(fields.tipe).trim(),
        tahun: parseInt(String(fields.tahun)),
        warna: String(fields.warna).trim(),
        noPol: String(fields.noPol).trim().toUpperCase(),
        noRangka: String(fields.noRangka).trim().toUpperCase(),
        noMesin: String(fields.noMesin).trim().toUpperCase(),
        kapasitas_mesin: parseInt(String(fields.kapasitas_mesin)),
        bahan_bakar: String(fields.bahan_bakar).trim(),
        transmisi: String(fields.transmisi).trim(),
        kilometer: String(fields.kilometer).trim(),
        harga: parseInt(String(fields.harga)),
        dp: parseInt(String(fields.dp)),
        angsuran_4_thn: parseInt(String(fields.angsuran_4_thn)),
        angsuran_5_tahun: parseInt(String(fields.angsuran_5_tahun)),
        pajak: String(fields.pajak),
        STNK: String(fields.STNK),
        BPKB: String(fields.BPKB),
        Faktur: String(fields.Faktur),
        deskripsi: String(fields.deskripsi).trim(),
        status: String(fields.status) || "tersedia",
        fotos: savedFileNames,
      };

      // Validate converted data
      if (
        isNaN(mobilData.tahun) ||
        isNaN(mobilData.harga) ||
        isNaN(mobilData.dp)
      ) {
        throw new Error("Invalid numeric values");
      }

      logDebug("✓ Data prepared for database", {
        merek: mobilData.merek,
        tipe: mobilData.tipe,
        tahun: mobilData.tahun,
        fotosCount: mobilData.fotos.length,
      });
    } catch (dataError) {
      logError("✗ Data preparation failed:", dataError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format",
          error:
            process.env.NODE_ENV === "development"
              ? String(dataError)
              : "Data validation error",
          timestamp: new Date().toISOString(),
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Save to database
    let savedMobil: any;

    try {
      logDebug("Saving to database...");
      const newMobil = new Mobil(mobilData);
      savedMobil = await newMobil.save();

      logDebug("✓ Mobil saved to database", {
        id: savedMobil._id,
        merek: savedMobil.merek,
        tipe: savedMobil.tipe,
      });
    } catch (dbSaveError) {
      logError("✗ Database save failed:", dbSaveError);

      // Clean up uploaded files if database save fails
      for (const fileName of savedFileNames) {
        try {
          await unlink(path.join(uploadsDir, fileName));
          logDebug("Cleaned up file after DB error:", fileName);
        } catch (cleanupError) {
          logError("File cleanup error:", cleanupError);
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to save to database",
          error:
            process.env.NODE_ENV === "development"
              ? String(dbSaveError)
              : "Database save error",
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const processingTime = Date.now() - startTime;
    logDebug(`✓ Request completed successfully in ${processingTime}ms`);

    return NextResponse.json(
      {
        success: true,
        message: "Mobil berhasil ditambahkan",
        data: {
          _id: savedMobil._id,
          merek: savedMobil.merek,
          tipe: savedMobil.tipe,
          tahun: savedMobil.tahun,
          fotosCount: savedMobil.fotos.length,
        },
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
      },
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logError("✗ Unhandled error in POST /api/mobil:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : "Server error",
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// GET: Test endpoint
export async function GET() {
  try {
    logDebug("=== GET /api/mobil called ===");

    // Test database connection
    try {
      await connectMongo();
      logDebug("✓ MongoDB connected for GET request");
    } catch (dbError) {
      logError("✗ MongoDB connection failed in GET:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error:
            process.env.NODE_ENV === "development"
              ? String(dbError)
              : "Database error",
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const count = await Mobil.countDocuments();
    logDebug("✓ Retrieved mobil count:", count);

    return NextResponse.json(
      {
        success: true,
        message: "API endpoint is working",
        totalMobils: count,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongoStatus: "connected",
        serverInfo: {
          platform: process.platform,
          nodeVersion: process.version,
          memory: process.memoryUsage(),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    logError("✗ Error in GET /api/mobil:", error);

    return NextResponse.json(
      {
        success: false,
        message: "API endpoint error",
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : "Server error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
