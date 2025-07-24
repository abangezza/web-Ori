"use client";
import React, { useState, useEffect } from "react";
import {
  Eye,
  Calendar,
  Phone,
  Car,
  User,
  Hash,
  Search,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface MobilData {
  _id: string;
  merek: string;
  tipe: string;
  noPol: string;
}

interface TestDriveBooking {
  _id: string;
  namaCustomer: string;
  noHp: string;
  mobilId: MobilData;
  tanggalTest: string;
  createdAt: string;
  updatedAt: string;
}

const AdminTestDriveTable = () => {
  const [bookings, setBookings] = useState<TestDriveBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<TestDriveBooking[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] =
    useState<TestDriveBooking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingExpired, setDeletingExpired] = useState(false);

  // State untuk menyimpan statistik
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    active: 0,
    expired: 0,
  });

  // Fetch data booking test drive
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings berdasarkan search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter((booking) => {
        const searchLower = searchTerm.toLowerCase();
        const namaMatch = booking.namaCustomer
          .toLowerCase()
          .includes(searchLower);
        const tipeMatch =
          booking.mobilId?.tipe?.toLowerCase().includes(searchLower) || false;
        const nopolMatch =
          booking.mobilId?.noPol?.toLowerCase().includes(searchLower) || false;
        const merekMatch =
          booking.mobilId?.merek?.toLowerCase().includes(searchLower) || false;

        return namaMatch || tipeMatch || nopolMatch || merekMatch;
      });
      setFilteredBookings(filtered);
    }
  }, [bookings, searchTerm]);

  // Hitung statistik ketika data bookings berubah
  useEffect(() => {
    calculateStats();
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/test-drive-booking");

      if (!response.ok) {
        throw new Error("Gagal mengambil data booking");
      }

      const result = await response.json();
      setBookings(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics - PERBAIKAN UTAMA
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newStats = {
      total: bookings.length,
      today: 0,
      active: 0,
      expired: 0,
    };

    bookings.forEach((booking) => {
      const testDate = new Date(booking.tanggalTest);
      testDate.setHours(0, 0, 0, 0);

      if (testDate < today) {
        newStats.expired++;
      } else if (testDate.getTime() === today.getTime()) {
        newStats.today++;
        newStats.active++; // Today's bookings are also active
      } else {
        newStats.active++;
      }
    });

    setStats(newStats);
  };

  // Delete expired bookings
  const deleteExpiredBookings = async () => {
    try {
      setDeletingExpired(true);
      const response = await fetch("/api/test-drive-booking/cleanup", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus booking expired");
      }

      const result = await response.json();

      // Refresh data setelah cleanup
      await fetchBookings();

      alert(
        `Berhasil menghapus ${result.deletedCount} booking yang sudah expired`
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus booking expired"
      );
    } finally {
      setDeletingExpired(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Format tanggal ke format Indonesia
  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format tanggal singkat untuk tabel
  const formatTanggalSingkat = (tanggal: string) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format nomor HP
  const formatNoHp = (noHp: string) => {
    // Jika nomor dimulai dengan +62, ganti dengan 0
    if (noHp.startsWith("+62")) {
      return "0" + noHp.substring(3);
    }
    return noHp;
  };

  // Handle view detail
  const handleViewDetail = (booking: TestDriveBooking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // Handle close modal
  const closeDetailModal = () => {
    setSelectedBooking(null);
    setShowDetailModal(false);
  };

  // Get booking status
  const getBookingStatus = (tanggalTest: string) => {
    const testDate = new Date(tanggalTest);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    testDate.setHours(0, 0, 0, 0);

    if (testDate < today) {
      return "expired";
    } else if (testDate.getTime() === today.getTime()) {
      return "today";
    } else {
      return "upcoming";
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data booking...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                Booking Test Drive
              </h2>
              <p className="text-sm lg:text-base text-gray-600">
                Kelola semua booking test drive pelanggan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Stats Summary - PERBAIKAN: Gunakan stats dari state */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  Total: {stats.total}
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Aktif: {stats.active}
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                  Hari Ini: {stats.today}
                </div>
                <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                  Expired: {stats.expired}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={deleteExpiredBookings}
                  disabled={deletingExpired || stats.expired === 0}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-white font-medium transition flex items-center gap-2 text-sm ${
                    deletingExpired || stats.expired === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  title={
                    stats.expired === 0
                      ? "Tidak ada booking expired"
                      : `Hapus ${stats.expired} booking expired`
                  }
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {deletingExpired
                      ? "Menghapus..."
                      : `Hapus Expired (${stats.expired})`}
                  </span>
                </button>
                <button
                  onClick={fetchBookings}
                  className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, tipe mobil, atau no polisi..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {searchTerm && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                Hasil pencarian untuk "{searchTerm}": {filteredBookings.length}{" "}
                booking ditemukan
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-500 mb-4">
                  Tidak ditemukan booking dengan kata kunci "{searchTerm}"
                </p>
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Hapus Pencarian
                </button>
              </>
            ) : (
              <>
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Belum Ada Booking
                </h3>
                <p className="text-gray-500">
                  Booking test drive akan muncul di sini
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        No
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Nomor HP
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Mobil
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Tanggal Test Drive
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking, index) => {
                    const status = getBookingStatus(booking.tanggalTest);

                    return (
                      <tr
                        key={booking._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          status === "expired"
                            ? "bg-red-50"
                            : status === "today"
                            ? "bg-yellow-50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {index + 1}
                            {status === "expired" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                            {status === "today" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Hari Ini
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.namaCustomer}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-600 hover:text-blue-800">
                            <a
                              href={`https://wa.me/${booking.noHp.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {formatNoHp(booking.noHp)}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.mobilId ? (
                              <div>
                                <div className="font-medium">
                                  {booking.mobilId.merek} {booking.mobilId.tipe}
                                </div>
                                <div className="text-gray-500 font-mono text-xs">
                                  {booking.mobilId.noPol}
                                </div>
                              </div>
                            ) : (
                              <span className="text-red-500">
                                Data tidak tersedia
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm ${
                              status === "expired"
                                ? "text-red-600 font-medium"
                                : status === "today"
                                ? "text-yellow-600 font-medium"
                                : "text-gray-900"
                            }`}
                          >
                            {formatTanggalSingkat(booking.tanggalTest)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              status === "expired"
                                ? "bg-red-100 text-red-800"
                                : status === "today"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {status === "expired" ? (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Expired
                              </>
                            ) : status === "today" ? (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Hari Ini
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aktif
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetail(booking)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredBookings.map((booking, index) => {
                const status = getBookingStatus(booking.tanggalTest);

                return (
                  <div
                    key={booking._id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      status === "expired"
                        ? "bg-red-50"
                        : status === "today"
                        ? "bg-yellow-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              status === "expired"
                                ? "bg-red-100 text-red-800"
                                : status === "today"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {status === "expired"
                              ? "Expired"
                              : status === "today"
                              ? "Hari Ini"
                              : "Aktif"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {booking.namaCustomer}
                        </h3>
                        <p className="text-sm text-blue-600">
                          <a
                            href={`https://wa.me/${booking.noHp.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {formatNoHp(booking.noHp)}
                          </a>
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Mobil:</span>
                        <div className="text-right">
                          {booking.mobilId ? (
                            <>
                              <p className="font-medium">
                                {booking.mobilId.merek} {booking.mobilId.tipe}
                              </p>
                              <p className="text-gray-500 font-mono text-xs">
                                {booking.mobilId.noPol}
                              </p>
                            </>
                          ) : (
                            <span className="text-red-500">
                              Data tidak tersedia
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                          Tanggal Test Drive:
                        </span>
                        <p
                          className={`font-medium ${
                            status === "expired"
                              ? "text-red-600"
                              : status === "today"
                              ? "text-yellow-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatTanggalSingkat(booking.tanggalTest)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Detail Booking Test Drive
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Informasi Customer
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium">
                      {selectedBooking.namaCustomer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">No HP:</span>
                    <span className="font-medium">
                      {formatNoHp(selectedBooking.noHp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Informasi Mobil
                </h4>
                {selectedBooking.mobilId ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Merek:</span>
                      <span className="font-medium">
                        {selectedBooking.mobilId.merek}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipe:</span>
                      <span className="font-medium">
                        {selectedBooking.mobilId.tipe}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">No Polisi:</span>
                      <span className="font-medium font-mono">
                        {selectedBooking.mobilId.noPol}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-red-500">
                    Data mobil tidak tersedia
                  </span>
                )}
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Informasi Test Drive
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-medium">
                      {formatTanggal(selectedBooking.tanggalTest)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        getBookingStatus(selectedBooking.tanggalTest) ===
                        "expired"
                          ? "text-red-600"
                          : getBookingStatus(selectedBooking.tanggalTest) ===
                            "today"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {getBookingStatus(selectedBooking.tanggalTest) ===
                      "expired"
                        ? "Expired"
                        : getBookingStatus(selectedBooking.tanggalTest) ===
                          "today"
                        ? "Hari Ini"
                        : "Aktif"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dibuat:</span>
                    <span className="font-medium">
                      {formatTanggalSingkat(selectedBooking.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/${selectedBooking.noHp.replace(
                      /\D/g,
                      ""
                    )}?text=Halo ${
                      selectedBooking.namaCustomer
                    }, mengenai booking test drive Anda...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <button
                    onClick={closeDetailModal}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestDriveTable;
