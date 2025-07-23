import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// POST: Tambah mobil baru
export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    const files = formData.getAll("fotos") as File[];

    console.log("Received fields:", fields);
    console.log("Received files:", files.length);

    // Validasi file foto
    if (!files || files.length < 6 || files.length > 10) {
      return NextResponse.json(
        { message: "Wajib upload minimal 6 foto dan maksimal 10 foto" },
        { status: 400 }
      );
    }

    // Validasi file type dan size
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Semua file harus berupa gambar" },
          { status: 400 }
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Ukuran file maksimal 5MB per foto" },
          { status: 400 }
        );
      }
    }

    // Buat folder uploads jika belum ada
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Simpan foto-foto
    const savedFileNames: string[] = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      await writeFile(filePath, buffer);
      savedFileNames.push(fileName);
      console.log("Saved file:", fileName);
    }

    // Transform data untuk database
    const mobilData = {
      merek: fields.merek,
      tipe: fields.tipe,
      tahun: parseInt(fields.tahun as string),
      warna: fields.warna,
      noPol: fields.noPol,
      noRangka: fields.noRangka,
      noMesin: fields.noMesin,
      kapasitas_mesin: parseInt(fields.kapasitas_mesin as string),
      bahan_bakar: fields.bahan_bakar,
      transmisi: fields.transmisi,
      kilometer: fields.kilometer,
      harga: parseInt(fields.harga as string),
      dp: parseInt(fields.dp as string),
      angsuran_4_thn: parseInt(fields.angsuran_4_thn as string),
      angsuran_5_tahun: parseInt(fields.angsuran_5_tahun as string),
      pajak: fields.pajak,
      STNK: fields.STNK,
      BPKB: fields.BPKB,
      Faktur: fields.Faktur,
      deskripsi: fields.deskripsi,
      status: fields.status || "tersedia",
      fotos: savedFileNames,
    };

    console.log("Mobil data to save:", mobilData);

    // Simpan ke MongoDB
    const newMobil = new Mobil(mobilData);
    const savedMobil = await newMobil.save();

    return NextResponse.json(
      {
        message: "Mobil berhasil ditambahkan",
        data: savedMobil,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving mobil:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan data mobil",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET: Ambil semua mobil (optional)
export async function GET() {
  try {
    await connectMongo();
    const mobils = await Mobil.find().sort({ createdAt: -1 });

    return NextResponse.json({
      message: "Data mobil berhasil diambil",
      data: mobils,
    });
  } catch (error) {
    console.error("Error fetching mobils:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data mobil" },
      { status: 500 }
    );
  }
}
