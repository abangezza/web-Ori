// src/app/api/mobil/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import fs from "fs";
import path from "path";
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const { status } = await request.json();
    
    // Validasi status
    if (!['tersedia', 'terjual'].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const updatedMobil = await Mobil.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedMobil) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Status berhasil diupdate",
      data: updatedMobil,
    });

  } catch (error) {
    console.error("Error updating mobil status:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const formData = await request.formData();
    const fields = Object.fromEntries(formData.entries());
    const files = formData.getAll('fotos') as File[];
    const updateMode = fields.updateMode as string; // 'add' or 'replace'

    // Cari mobil yang akan diupdate
    const existingMobil = await Mobil.findById(params.id);
    if (!existingMobil) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    let savedFileNames: string[] = existingMobil.fotos || [];

    // Jika ada foto baru yang diupload
    if (files.length > 0) {
      // Validasi file foto
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          return NextResponse.json({ 
            message: 'Semua file harus berupa gambar' 
          }, { status: 400 });
        }
        
        // Validasi ukuran file (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json({ 
            message: 'Ukuran file maksimal 5MB per foto' 
          }, { status: 400 });
        }
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      // Simpan foto baru
      const newFileNames: string[] = [];
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        await writeFile(filePath, buffer);
        newFileNames.push(fileName);
      }

      // Logic untuk mengelola foto berdasarkan kondisi
      const currentPhotos = existingMobil.fotos || [];
      const currentCount = currentPhotos.length;
      
      if (updateMode === 'add') {
        // Mode: Tambah foto baru
        if (currentCount > 10) {
          // Jika foto saat ini > 10, hapus dari index 0
          const photosToRemove = currentCount - 10;
          const photosToDelete = currentPhotos.slice(0, photosToRemove);
          
          // Hapus file foto yang akan dihapus
          photosToDelete.forEach((foto: string) => {
            const filePath = path.join(uploadsDir, foto);
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (fileError) {
              console.warn(`Gagal menghapus file ${foto}:`, fileError);
            }
          });
          
          // Update array: ambil foto dari index photosToRemove sampai akhir, lalu tambah foto baru
          savedFileNames = [...currentPhotos.slice(photosToRemove), ...newFileNames];
        } else {
          // Jika foto saat ini <= 10, tambah foto baru
          savedFileNames = [...currentPhotos, ...newFileNames];
        }
        
        // Validasi total foto setelah update
        if (savedFileNames.length > 10) {
          // Jika masih > 10, potong dari belakang
          const excessPhotos = savedFileNames.slice(10);
          
          // Hapus file yang berlebih
          excessPhotos.forEach((foto: string) => {
            const filePath = path.join(uploadsDir, foto);
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (fileError) {
              console.warn(`Gagal menghapus file ${foto}:`, fileError);
            }
          });
          
          savedFileNames = savedFileNames.slice(0, 10);
        }
        
        if (savedFileNames.length < 6) {
          return NextResponse.json({ 
            message: 'Total foto setelah update tidak boleh kurang dari 6' 
          }, { status: 400 });
        }
      } else {
        // Mode: Ganti semua foto (default/legacy behavior)
        if (newFileNames.length < 6 || newFileNames.length > 10) {
          return NextResponse.json({ 
            message: 'Jumlah foto harus minimal 6 dan maksimal 10' 
          }, { status: 400 });
        }
        
        // Hapus semua foto lama
        if (currentPhotos.length > 0) {
          currentPhotos.forEach((foto: string) => {
            const filePath = path.join(uploadsDir, foto);
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (fileError) {
              console.warn(`Gagal menghapus file ${foto}:`, fileError);
            }
          });
        }
        
        savedFileNames = newFileNames;
      }
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
      STNK: fields.STNK as string,
      BPKB: fields.BPKB as string,
      Faktur: fields.Faktur as string,
      deskripsi: fields.deskripsi,
      status: fields.status,
      fotos: savedFileNames,
    };

    console.log('UPDATE FIELDS:', fields);
    console.log('CURRENT PHOTOS:', existingMobil.fotos?.length || 0);
    console.log('NEW PHOTOS:', files.length);
    console.log('FINAL PHOTOS:', savedFileNames.length);
    console.log('UPDATE PROCESSED DATA:', mobilData);

    // Update data mobil di MongoDB
    const updatedMobil = await Mobil.findByIdAndUpdate(
      params.id,
      mobilData,
      { new: true }
    );

    return NextResponse.json({ 
      message: 'Mobil berhasil diupdate',
      data: updatedMobil 
    }, { status: 200 });

  } catch (error) {
    console.error('Error saat update mobil:', error);
    return NextResponse.json({ 
      message: 'Gagal mengupdate data', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    // Cari mobil berdasarkan ID
    const mobil = await Mobil.findById(params.id);
    
    if (!mobil) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus file foto yang terkait (opsional)
    if (mobil.fotos && mobil.fotos.length > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      mobil.fotos.forEach((foto: string) => {
        const filePath = path.join(uploadsDir, foto);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.warn(`Gagal menghapus file ${foto}:`, fileError);
          // Lanjutkan proses meskipun gagal menghapus file
        }
      });
    }

    // Hapus data mobil dari database
    await Mobil.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Mobil berhasil dihapus",
      data: { id: params.id }
    });

  } catch (error) {
    console.error("Error deleting mobil:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menghapus mobil" },
      { status: 500 }
    );
  }
}

// Opsional: Tambahkan handler GET untuk mengambil data mobil berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const mobil = await Mobil.findById(params.id);
    
    if (!mobil) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data mobil berhasil diambil",
      data: mobil
    });

  } catch (error) {
    console.error("Error fetching mobil:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}