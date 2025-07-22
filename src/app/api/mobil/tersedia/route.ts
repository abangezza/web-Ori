// src/app/api/mobil/tersedia/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/conn';
import Mobil from '@/models/Mobil';

export async function GET() {
  try {
    await connectMongo();
    
    // Ambil semua mobil dengan status tersedia
    const mobils = await Mobil.find({ status: 'tersedia' })
      .sort({ createdAt: -1 }) // Urutkan berdasarkan yang terbaru
      .lean();

    // Transform data untuk response
    const transformedMobils = mobils.map((mobil: any) => ({
      ...mobil,
      _id: mobil._id.toString(),
    }));

    return NextResponse.json(transformedMobils);
  } catch (error) {
    console.error('Error fetching available cars:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data mobil tersedia' },
      { status: 500 }
    );
  }
}