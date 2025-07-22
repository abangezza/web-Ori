// src/app/api/test-drive-booking/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/conn';
import TestDriveBooking from '@/models/testdrivebooking';
import Mobil from '@/models/Mobil';
import { TestDriveBookingType } from '@/types/testdrivebooking';

export async function POST(request: Request) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const { namaCustomer, noHp, mobilId, tanggalTest }: TestDriveBookingType = body;

    // Validasi input
    if (!namaCustomer || !noHp || !mobilId || !tanggalTest) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Validasi nomor HP Indonesia
    const validateWhatsappNumber = (number: string): boolean => {
      const cleanNumber = number.replace(/\D/g, '');
      const patterns = [
        /^08\d{8,11}$/,
        /^628\d{8,11}$/,
        /^\+628\d{8,11}$/
      ];
      return patterns.some(pattern => pattern.test(number));
    };

    if (!validateWhatsappNumber(noHp)) {
      return NextResponse.json(
        { error: 'Format nomor WhatsApp tidak valid' },
        { status: 400 }
      );
    }

    // Validasi tanggal tidak boleh masa lalu
    const selectedDate = new Date(tanggalTest);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Tanggal test drive tidak boleh di masa lalu' },
        { status: 400 }
      );
    }

    // Validasi mobil exists
    const mobil = await Mobil.findById(mobilId);
    if (!mobil) {
      return NextResponse.json(
        { error: 'Mobil tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validasi mobil harus tersedia
    if (mobil.status !== 'tersedia') {
      return NextResponse.json(
        { error: 'Mobil tidak tersedia untuk test drive' },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada booking di tanggal yang sama untuk mobil yang sama
    const existingBooking = await TestDriveBooking.findOne({
      mobilId: mobilId,
      tanggalTest: {
        $gte: new Date(tanggalTest + 'T00:00:00.000Z'),
        $lt: new Date(tanggalTest + 'T23:59:59.999Z')
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Mobil sudah dibooking untuk test drive di tanggal tersebut' },
        { status: 400 }
      );
    }

    // Simpan booking
    const newBooking = new TestDriveBooking({
      namaCustomer: namaCustomer.trim(),
      noHp: noHp.trim(),
      mobilId,
      tanggalTest: new Date(tanggalTest)
    });

    const savedBooking = await newBooking.save();

    // Populate mobil data untuk response
    const populatedBooking = await TestDriveBooking.findById(savedBooking._id)
      .populate('mobilId')
      .exec();

    return NextResponse.json({
      success: true,
      message: 'Booking test drive berhasil disimpan',
      data: populatedBooking
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving test drive booking:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongo();
    
    // Get all bookings dengan populate mobil data
    const bookings = await TestDriveBooking.find()
      .populate('mobilId')
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching test drive bookings:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}