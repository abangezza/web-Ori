// src/app/api/mobil/[id]/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Untuk PUT request (update seluruh data termasuk foto)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    // Parse form data
    const formData = await req.formData();

    // Get existing mobil data
    const existingMobil = await Mobil.findById(params.id);
    if (!existingMobil) {
      return NextResponse.json(
        { success: false, message: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log(
      `🚗 Updating mobil: ${existingMobil.merek} ${existingMobil.tipe}`
    );
    console.log(`📸 Current photos: ${existingMobil.fotos?.length || 0}`);

    // Extract form fields
    const updateData: any = {};
    const formFields = [
      "merek",
      "tipe",
      "tahun",
      "warna",
      "noPol",
      "noRangka",
      "noMesin",
      "kapasitas_mesin",
      "bahan_bakar",
      "transmisi",
      "kilometer",
      "harga",
      "dp",
      "angsuran_4_thn",
      "angsuran_5_tahun",
      "pajak",
      "STNK",
      "BPKB",
      "Faktur",
      "deskripsi",
      "status",
    ];

    // Extract regular form fields
    formFields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null) {
        if (
          [
            "tahun",
            "kapasitas_mesin",
            "kilometer",
            "harga",
            "dp",
            "angsuran_4_thn",
            "angsuran_5_tahun",
          ].includes(field)
        ) {
          updateData[field] = Number(value);
        } else {
          updateData[field] = value.toString();
        }
      }
    });

    // Handle photo updates
    const newPhotos = formData.getAll("fotos") as File[];
    let finalFotos = [...(existingMobil.fotos || [])]; // Start with existing photos

    if (newPhotos.length > 0 && newPhotos[0].size > 0) {
      console.log(`📸 Processing ${newPhotos.length} new photos...`);

      // Validate new photos
      for (const photo of newPhotos) {
        if (!photo.type.startsWith("image/")) {
          return NextResponse.json(
            { success: false, message: "Semua file harus berupa gambar" },
            { status: 400 }
          );
        }
        if (photo.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, message: "Ukuran file maksimal 5MB per foto" },
            { status: 400 }
          );
        }
      }

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
        console.log(`📁 Created upload directory: ${uploadDir}`);
      }

      // Save new photos with unique names
      const savedPhotoNames: string[] = [];
      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i];

        try {
          const bytes = await photo.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename with timestamp
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);
          const fileExtension = path.extname(photo.name) || ".jpg";
          const fileName = `${timestamp}_${randomId}${fileExtension}`;
          const filePath = path.join(uploadDir, fileName);

          await writeFile(filePath, buffer);
          savedPhotoNames.push(fileName);
          console.log(
            `✅ Saved new photo ${i + 1}/${newPhotos.length}: ${fileName}`
          );
        } catch (photoError) {
          console.error(`❌ Failed to save photo ${i + 1}:`, photoError);
          // Clean up any successfully saved files
          for (const savedFile of savedPhotoNames) {
            try {
              await unlink(path.join(uploadDir, savedFile));
            } catch (cleanupError) {
              console.error(`Failed to cleanup ${savedFile}:`, cleanupError);
            }
          }
          return NextResponse.json(
            { success: false, message: `Gagal menyimpan foto ${i + 1}` },
            { status: 500 }
          );
        }
      }

      // Add new photos to the array
      finalFotos.push(...savedPhotoNames);
      console.log(
        `📸 Total photos after adding new ones: ${finalFotos.length}`
      );

      // 🔥 FIXED: Proper photo management with deletion
      if (finalFotos.length > 10) {
        const photosToRemove = finalFotos.length - 10;
        const removedPhotos = finalFotos.splice(0, photosToRemove); // Remove from beginning (oldest first)

        console.log(`🗑️ Removing ${photosToRemove} old photos:`, removedPhotos);

        // Delete removed photo files from server
        for (const photoName of removedPhotos) {
          try {
            const photoPath = path.join(uploadDir, photoName);
            if (existsSync(photoPath)) {
              await unlink(photoPath);
              console.log(`🗑️ Deleted old photo from server: ${photoName}`);
            } else {
              console.log(
                `⚠️ Photo not found on server (may be already deleted): ${photoName}`
              );
            }
          } catch (deleteError) {
            console.error(
              `❌ Failed to delete photo ${photoName}:`,
              deleteError
            );
            // Continue with the process even if file deletion fails
          }
        }
      }

      console.log(`📸 Final photo count: ${finalFotos.length}`);
    }

    // Update the mobil data
    updateData.fotos = finalFotos;

    const updatedMobil = await Mobil.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });

    console.log(
      `✅ Successfully updated mobil with ${finalFotos.length} photos`
    );

    return NextResponse.json({
      success: true,
      message: "Mobil berhasil diupdate",
      data: {
        _id: updatedMobil._id,
        merek: updatedMobil.merek,
        tipe: updatedMobil.tipe,
        photosCount: updatedMobil.fotos?.length || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error updating mobil:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Gagal mengupdate mobil",
      },
      { status: 500 }
    );
  }
}

// PATCH request untuk update status saja (tidak berubah)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const { status } = await req.json();

    const updatedMobil = await Mobil.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedMobil) {
      return NextResponse.json(
        { success: false, message: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status mobil berhasil diupdate",
      data: updatedMobil,
    });
  } catch (error) {
    console.error("Error updating mobil status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate status mobil" },
      { status: 500 }
    );
  }
}

// DELETE request (tidak berubah)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const mobil = await Mobil.findById(params.id);
    if (!mobil) {
      return NextResponse.json(
        { success: false, message: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete all photo files from server
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (mobil.fotos && mobil.fotos.length > 0) {
      for (const photoName of mobil.fotos) {
        try {
          const photoPath = path.join(uploadDir, photoName);
          if (existsSync(photoPath)) {
            await unlink(photoPath);
            console.log(`Deleted photo: ${photoName}`);
          }
        } catch (deleteError) {
          console.error(`Failed to delete photo ${photoName}:`, deleteError);
        }
      }
    }

    await Mobil.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Mobil dan semua foto berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting mobil:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus mobil" },
      { status: 500 }
    );
  }
}

// GET request (tidak berubah)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const mobil = await Mobil.findById(params.id);

    if (!mobil) {
      return NextResponse.json(
        { success: false, message: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mobil,
    });
  } catch (error) {
    console.error("Error fetching mobil:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data mobil" },
      { status: 500 }
    );
  }
}
