'use client';
import React, { useState, useEffect } from 'react';
import { Eye, Calendar, Phone, Car, User, Hash } from 'lucide-react';

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
  const [filteredBookings, setFilteredBookings] = useState<TestDriveBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<TestDriveBooking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingExpired, setDeletingExpired] = useState(false);

  // Fetch data booking test drive
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings berdasarkan search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(booking => {
        const searchLower = searchTerm.toLowerCase();
        const namaMatch = booking.namaCustomer.toLowerCase().includes(searchLower);
        const tipeMatch = booking.mobilId?.tipe?.toLowerCase().includes(searchLower) || false;
        const nopolMatch = booking.mobilId?.noPol?.toLowerCase().includes(searchLower) || false;
        const merekMatch = booking.mobilId?.merek?.toLowerCase().includes(searchLower) || false;
        
        return namaMatch || tipeMatch || nopolMatch || merekMatch;
      });
      setFilteredBookings(filtered);
    }
  }, [bookings, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-drive-booking');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data booking');
      }
      
      const result = await response.json();
      setBookings(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Delete expired bookings
  const deleteExpiredBookings = async () => {
    try {
      setDeletingExpired(true);
      const response = await fetch('/api/test-drive-booking/cleanup', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus booking expired');
      }
      
      const result = await response.json();
      
      // Refresh data setelah cleanup
      await fetchBookings();
      
      alert(`Berhasil menghapus ${result.deletedCount} booking yang sudah expired`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus booking expired');
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
    setSearchTerm('');
  };

  // Format tanggal ke format Indonesia
  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format tanggal singkat untuk tabel
  const formatTanggalSingkat = (tanggal: string) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format nomor HP
  const formatNoHp = (noHp: string) => {
    // Jika nomor dimulai dengan +62, ganti dengan 0
    if (noHp.startsWith('+62')) {
      return '0' + noHp.substring(3);
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

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
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
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Terjadi Kesalahan</h3>
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
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Booking Test Drive</h2>
              <p className="text-gray-600">Kelola semua booking test drive pelanggan</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Total: {filteredBookings.length} booking
              </div>
              <button 
                onClick={deleteExpiredBookings}
                disabled={deletingExpired}
                className={`px-4 py-2 rounded-lg text-white font-medium transition flex items-center gap-2 ${
                  deletingExpired 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deletingExpired ? 'Menghapus...' : 'Hapus Expired'}
              </button>
              <button 
                onClick={fetchBookings}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, tipe mobil, atau no polisi..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {searchTerm && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                Hasil pencarian untuk "{searchTerm}": {filteredBookings.length} booking ditemukan
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak Ada Hasil</h3>
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Booking</h3>
                <p className="text-gray-500">Booking test drive akan muncul di sini</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                      Nama Customer
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
                      Tipe Mobil
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No Polisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal Test Drive
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => {
                  // Check if booking is expired
                  const isExpired = new Date(booking.tanggalTest) < new Date();
                  
                  return (
                    <tr 
                      key={booking._id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isExpired ? 'bg-red-50 opacity-75' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                        {isExpired && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.namaCustomer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatNoHp(booking.noHp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.mobilId ? (
                            <div>
                              <div className="font-medium">{booking.mobilId.merek}</div>
                              <div className="text-gray-500">{booking.mobilId.tipe}</div>
                            </div>
                          ) : (
                            <span className="text-red-500">Data tidak tersedia</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {booking.mobilId?.noPol || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {formatTanggalSingkat(booking.tanggalTest)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Detail Booking Test Drive</h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Informasi Customer</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium">{selectedBooking.namaCustomer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">No HP:</span>
                    <span className="font-medium">{formatNoHp(selectedBooking.noHp)}</span>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Informasi Mobil</h4>
                {selectedBooking.mobilId ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Merek:</span>
                      <span className="font-medium">{selectedBooking.mobilId.merek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipe:</span>
                      <span className="font-medium">{selectedBooking.mobilId.tipe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">No Polisi:</span>
                      <span className="font-medium font-mono">{selectedBooking.mobilId.noPol}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-red-500">Data mobil tidak tersedia</span>
                )}
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Informasi Test Drive</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-medium">{formatTanggal(selectedBooking.tanggalTest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dibuat:</span>
                    <span className="font-medium">{formatTanggalSingkat(selectedBooking.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/${selectedBooking.noHp.replace(/\D/g, '')}?text=Halo ${selectedBooking.namaCustomer}, mengenai booking test drive Anda...`}
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