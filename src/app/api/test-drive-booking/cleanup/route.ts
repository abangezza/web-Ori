// src/app/api/test-drive-booking/cleanup/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/conn';
import TestDriveBooking from '@/models/testdrivebooking';

export async function DELETE() {
  try {
    await connectMongo();
    
    // Get current date at start of today (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Delete all bookings where tanggalTest is before today
    const result = await TestDriveBooking.deleteMany({
      tanggalTest: {
        $lt: today
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${result.deletedCount} booking yang expired`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up expired bookings:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus booking expired' },
      { status: 500 }
    );
  }
}