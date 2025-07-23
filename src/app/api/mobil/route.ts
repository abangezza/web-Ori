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
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] ${message}`, data || "");
  }
}

// POST: Tambah mobil baru
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    logDebug("POST /api/mobil started");

    // Test database connection first
    try {
      await connectMongo();
      logDebug("MongoDB connected successfully");
    } catch (dbError) {
      console.error("MongoDB connection failed:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error:
            process.env.NODE_ENV === "development"
              ? String(dbError)
              : "Database error",
        },
        { status: 500 }
      );
    }

    // Parse form data with error handling
    let formData: FormData;
    let fields: Record<string, any>;
    let files: File[];

    try {
      formData = await request.formData();
      fields = Object.fromEntries(formData.entries());
      files = formData.getAll("fotos") as File[];

      logDebug("Form data parsed", {
        fieldCount: Object.keys(fields).length,
        fileCount: files.length,
      });
    } catch (parseError) {
      console.error("Form data parsing failed:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to parse form data",
          error:
            process.env.NODE_ENV === "development"
              ? String(parseError)
              : "Parse error",
        },
        { status: 400 }
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
      logDebug("Missing required fields", missingFields);
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate files
    if (!files || files.length < 6 || files.length > 10) {
      logDebug("File validation failed", { fileCount: files?.length || 0 });
      return NextResponse.json(
        {
          success: false,
          message: "Wajib upload minimal 6 foto dan maksimal 10 foto",
          receivedFiles: files?.length || 0,
        },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            success: false,
            message: `File ${i + 1} bukan gambar: ${file.type}`,
            fileType: file.type,
          },
          { status: 400 }
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message: `File ${i + 1} terlalu besar: ${(
              file.size /
              1024 /
              1024
            ).toFixed(2)}MB`,
            maxSize: "5MB",
          },
          { status: 400 }
        );
      }
    }

    // Create uploads directory with proper error handling
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
        logDebug("Created uploads directory", uploadsDir);
      }
    } catch (dirError) {
      console.error("Failed to create uploads directory:", dirError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create uploads directory",
          error:
            process.env.NODE_ENV === "development"
              ? String(dirError)
              : "File system error",
        },
        { status: 500 }
      );
    }

    // Save files with individual error handling
    const savedFileNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        await writeFile(filePath, buffer);
        savedFileNames.push(fileName);

        logDebug(`Saved file ${i + 1}`, fileName);
      } catch (fileError) {
        console.error(`Error saving file ${i + 1}:`, fileError);

        // Clean up any successfully saved files
        for (const savedFile of savedFileNames) {
          try {
            await unlink(path.join(uploadsDir, savedFile));
          } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
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
          },
          { status: 500 }
        );
      }
    }

    // Prepare data for database with type conversion
    let mobilData: any;

    try {
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

      logDebug("Mobil data prepared", {
        merek: mobilData.merek,
        tipe: mobilData.tipe,
        tahun: mobilData.tahun,
        fotosCount: mobilData.fotos.length,
      });
    } catch (dataError) {
      console.error("Data preparation failed:", dataError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format",
          error:
            process.env.NODE_ENV === "development"
              ? String(dataError)
              : "Data validation error",
        },
        { status: 400 }
      );
    }

    // Save to database
    let savedMobil: any;

    try {
      const newMobil = new Mobil(mobilData);
      savedMobil = await newMobil.save();

      logDebug("Mobil saved to database", {
        id: savedMobil._id,
        merek: savedMobil.merek,
        tipe: savedMobil.tipe,
      });
    } catch (dbSaveError) {
      console.error("Database save failed:", dbSaveError);

      // Clean up uploaded files if database save fails
      for (const fileName of savedFileNames) {
        try {
          await unlink(path.join(uploadsDir, fileName));
        } catch (cleanupError) {
          console.error("File cleanup error:", cleanupError);
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
        },
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;
    logDebug(`Request completed in ${processingTime}ms`);

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
      },
      { status: 201 }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("Unhandled error in POST /api/mobil:", error);

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
      },
      { status: 500 }
    );
  }
}

// GET: Test endpoint
export async function GET() {
  try {
    logDebug("GET /api/mobil called");

    await connectMongo();
    const count = await Mobil.countDocuments();

    return NextResponse.json({
      success: true,
      message: "API endpoint is working",
      totalMobils: count,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Error in GET /api/mobil:", error);

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
      { status: 500 }
    );
  }
}
