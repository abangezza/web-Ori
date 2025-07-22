// src/app/api/mobil/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// PUT method untuk update mobil
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();

  try {
    const { id } = params;

    // Cek apakah mobil ada
    const existingMobil = await Mobil.findById(id);
    if (!existingMobil) {
      return NextResponse.json(
        {
          message: "Mobil tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());
    const files = formData.getAll("fotos") as File[];
    const updateMode = formData.get("updateMode") as string;

    console.log("Update mode:", updateMode);
    console.log("Files received:", files.length);
    console.log("Existing photos:", existingMobil.fotos?.length || 0);

    let updatedPhotos = [...(existingMobil.fotos || [])];
    const photosToDelete: string[] = [];

    // Handle photo updates
    if (files.length > 0) {
      // Validasi file foto
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          return NextResponse.json(
            {
              message: "Semua file harus berupa gambar",
            },
            { status: 400 }
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              message: "Ukuran file maksimal 5MB per foto",
            },
            { status: 400 }
          );
        }
      }

      // Validasi jumlah foto
      if (files.length > 10) {
        return NextResponse.json(
          {
            message: "Maksimal 10 foto baru yang bisa ditambahkan sekaligus",
          },
          { status: 400 }
        );
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Simpan foto baru
      const savedFileNames: string[] = [];
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        savedFileNames.push(fileName);
      }

      // Logic untuk menambahkan foto baru
      if (updateMode === "add") {
        // Tambahkan foto baru ke array existing
        updatedPhotos = [...updatedPhotos, ...savedFileNames];

        // Jika total foto > 10, hapus foto dari awal
        if (updatedPhotos.length > 10) {
          const photosToRemove = updatedPhotos.length - 10;

          // Tandai foto yang akan dihapus
          for (let i = 0; i < photosToRemove; i++) {
            photosToDelete.push(updatedPhotos[i]);
          }

          // Ambil 10 foto terakhir
          updatedPhotos = updatedPhotos.slice(photosToRemove);
        }
      } else {
        // Mode replace (jika diperlukan di masa depan)
        photosToDelete.push(...existingMobil.fotos);
        updatedPhotos = savedFileNames;
      }

      // Validasi final jumlah foto
      if (updatedPhotos.length < 6) {
        return NextResponse.json(
          {
            message: "Total foto setelah update tidak boleh kurang dari 6",
          },
          { status: 400 }
        );
      }

      if (updatedPhotos.length > 10) {
        return NextResponse.json(
          {
            message: "Total foto setelah update tidak boleh lebih dari 10",
          },
          { status: 400 }
        );
      }

      // Hapus foto lama yang sudah tidak digunakan
      for (const photoToDelete of photosToDelete) {
        try {
          const oldFilePath = path.join(uploadDir, photoToDelete);
          await unlink(oldFilePath);
          console.log(`Deleted old photo: ${photoToDelete}`);
        } catch (error) {
          console.error(`Failed to delete photo ${photoToDelete}:`, error);
          // Continue dengan proses lain meskipun gagal hapus foto
        }
      }

      console.log("Photos deleted:", photosToDelete.length);
      console.log("Photos after update:", updatedPhotos.length);
    }

    // Siapkan data untuk update
    const updateData: any = {};

    // Update fields yang diberikan
    if (fields.merek) updateData.merek = fields.merek;
    if (fields.tipe) updateData.tipe = fields.tipe;
    if (fields.tahun) updateData.tahun = parseInt(fields.tahun as string);
    if (fields.warna) updateData.warna = fields.warna;
    if (fields.noPol) updateData.noPol = (fields.noPol as string).toUpperCase();
    if (fields.noRangka)
      updateData.noRangka = (fields.noRangka as string).toUpperCase();
    if (fields.noMesin)
      updateData.noMesin = (fields.noMesin as string).toUpperCase();
    if (fields.kapasitas_mesin)
      updateData.kapasitas_mesin = parseInt(fields.kapasitas_mesin as string);
    if (fields.bahan_bakar) updateData.bahan_bakar = fields.bahan_bakar;
    if (fields.transmisi) updateData.transmisi = fields.transmisi;
    if (fields.kilometer) updateData.kilometer = fields.kilometer;
    if (fields.harga) updateData.harga = parseInt(fields.harga as string);
    if (fields.dp) updateData.dp = parseInt(fields.dp as string);
    if (fields.angsuran_4_thn)
      updateData.angsuran_4_thn = parseInt(fields.angsuran_4_thn as string);
    if (fields.angsuran_5_tahun)
      updateData.angsuran_5_tahun = parseInt(fields.angsuran_5_tahun as string);
    if (fields.pajak) updateData.pajak = fields.pajak;
    if (fields.STNK) updateData.STNK = fields.STNK;
    if (fields.BPKB) updateData.BPKB = fields.BPKB;
    if (fields.Faktur) updateData.Faktur = fields.Faktur;
    if (fields.deskripsi) updateData.deskripsi = fields.deskripsi;
    if (fields.status) updateData.status = fields.status;

    // Update fotos jika ada perubahan
    if (files.length > 0) {
      updateData.fotos = updatedPhotos;
    }

    // Update mobil di database
    const updatedMobil = await Mobil.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      {
        message: "Mobil berhasil diupdate",
        data: updatedMobil,
        photosDeleted: photosToDelete.length,
        totalPhotos: updatedPhotos.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating mobil:", error);
    return NextResponse.json(
      {
        message: "Gagal mengupdate mobil",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH method untuk update status saja
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();

  try {
    const { id } = params;
    const { status } = await req.json();

    if (!status || !["tersedia", "terjual"].includes(status)) {
      return NextResponse.json(
        {
          message: "Status tidak valid",
        },
        { status: 400 }
      );
    }

    const updatedMobil = await Mobil.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedMobil) {
      return NextResponse.json(
        {
          message: "Mobil tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Status mobil berhasil diupdate",
        data: updatedMobil,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating mobil status:", error);
    return NextResponse.json(
      {
        message: "Gagal mengupdate status mobil",
      },
      { status: 500 }
    );
  }
}

// DELETE method untuk hapus mobil dan semua fotonya
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();

  try {
    const { id } = params;

    // Cari mobil yang akan dihapus
    const mobilToDelete = await Mobil.findById(id);
    if (!mobilToDelete) {
      return NextResponse.json(
        {
          message: "Mobil tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const photosDeleted: string[] = [];
    const photosFailedToDelete: string[] = [];

    // Hapus semua foto dari file system
    if (mobilToDelete.fotos && mobilToDelete.fotos.length > 0) {
      for (const photoFileName of mobilToDelete.fotos) {
        try {
          const filePath = path.join(uploadDir, photoFileName);
          await unlink(filePath);
          photosDeleted.push(photoFileName);
          console.log(`Deleted photo: ${photoFileName}`);
        } catch (error) {
          console.error(`Failed to delete photo ${photoFileName}:`, error);
          photosFailedToDelete.push(photoFileName);
        }
      }
    }

    // Hapus data mobil dari database
    await Mobil.findByIdAndDelete(id);

    const response = {
      message: "Mobil berhasil dihapus",
      deletedMobil: {
        id: mobilToDelete._id,
        merek: mobilToDelete.merek,
        tipe: mobilToDelete.tipe,
        noPol: mobilToDelete.noPol,
      },
      photosDeleted: photosDeleted.length,
      photosFailedToDelete: photosFailedToDelete.length,
    };

    if (photosFailedToDelete.length > 0) {
      response.message += ` (${photosFailedToDelete.length} foto gagal dihapus dari file system)`;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deleting mobil:", error);
    return NextResponse.json(
      {
        message: "Gagal menghapus mobil",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET method untuk mendapatkan detail mobil
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();

  try {
    const { id } = params;

    const mobil = await Mobil.findById(id);
    if (!mobil) {
      return NextResponse.json(
        {
          message: "Mobil tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Data mobil berhasil diambil",
        data: mobil,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching mobil:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil data mobil",
      },
      { status: 500 }
    );
  }
}
