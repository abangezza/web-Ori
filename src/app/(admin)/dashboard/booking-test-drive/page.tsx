// src/app/(admin)/dashboard/booking-test-drive/page.tsx - Fixed Version with Stats
import React from "react";
import AdminTestDriveTable from "@/components/AdminTestDriveTable";
import connectMongo from "@/lib/conn";
import TestDriveBooking from "@/models/testdrivebooking";

export default async function BookingTestDrivePage() {
  // Fetch data untuk statistik
  let stats = {
    total: 0,
    today: 0,
    active: 0,
    expired: 0,
  };

  try {
    await connectMongo();

    // Get all bookings
    const allBookings = await TestDriveBooking.find().lean();

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    stats.total = allBookings.length;

    allBookings.forEach((booking) => {
      const testDate = new Date(booking.tanggalTest);
      testDate.setHours(0, 0, 0, 0);

      if (testDate <= today) {
        stats.expired++;
      } else if (testDate.getTime() === today.getTime()) {
        stats.today++;
        stats.active++;
      } else {
        stats.active++;
      }
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    // Keep default stats if error occurs
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Booking Test Drive
                </h1>
                <p className="mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
                  Kelola dan pantau semua booking test drive dari pelanggan
                </p>
              </div>

              {/* Quick Stats - FIXED: Tampilkan data real dari database */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">
                    {stats.active}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 font-medium">
                    Booking Aktif
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    {stats.today}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 font-medium">
                    Test Drive Hari Ini
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-bold text-orange-600">
                    {stats.total}
                  </div>
                  <div className="text-xs sm:text-sm text-orange-600 font-medium">
                    Total Booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 sm:space-x-4">
            <li>
              <div className="flex items-center">
                <a
                  href="/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Dashboard
                </a>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  Booking Test Drive
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Feature Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Booking Hari Ini
                </p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  {stats.today}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Booking Aktif
                </p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Booking Expired
                </p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  {stats.expired}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Booking
                </p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 lg:mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Informasi Booking Test Drive
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="space-y-1">
                  <li>
                    • Kelola semua booking test drive pelanggan di halaman ini
                  </li>
                  <li>
                    • Gunakan fitur pencarian untuk menemukan booking spesifik
                  </li>
                  <li>
                    • Booking yang sudah expired akan ditandai dengan warna
                    merah
                  </li>
                  <li>
                    • Klik "Detail" untuk melihat informasi lengkap booking
                  </li>
                  <li>
                    • Gunakan tombol "Hapus Expired" untuk membersihkan booking
                    lama
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Component */}
        <AdminTestDriveTable />

        {/* Additional Info Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tips Mengelola Booking
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Hubungi pelanggan H-1 untuk konfirmasi test drive</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Pastikan mobil dalam kondisi siap untuk test drive</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>
                  Siapkan dokumen yang diperlukan (STNK, SIM pendamping)
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Lakukan pembersihan berkala untuk booking expired</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Status Booking
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                  Aktif
                </span>
                <span className="text-sm text-gray-600">
                  Booking masih berlaku dan menunggu test drive
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-3">
                  Hari Ini
                </span>
                <span className="text-sm text-gray-600">
                  Test drive dijadwalkan hari ini
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                  Expired
                </span>
                <span className="text-sm text-gray-600">
                  Tanggal test drive sudah terlewat
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 Ringkasan Statistik Booking
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Total Booking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-600">Booking Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.today}
                </div>
                <div className="text-sm text-gray-600">Hari Ini</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.expired}
                </div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
