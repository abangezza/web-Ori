// src/components/EnhancedTestDriveManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Car,
  User,
  Phone,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  MessageSquare,
} from "lucide-react";
import { TestDriveBookingWithMobil, TestDriveStats } from "@/types/mobil";

const EnhancedTestDriveManagement = () => {
  const [bookings, setBookings] = useState<TestDriveBookingWithMobil[]>([]);
  const [stats, setStats] = useState<TestDriveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] =
    useState<TestDriveBookingWithMobil | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchBookings();
    // Auto refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-expire old bookings when component mounts
    expireOldBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/test-drives");
      const result = await response.json();

      if (result.success) {
        setBookings(result.data);
        setStats(result.meta);
      }
    } catch (error) {
      console.error("Error fetching test drive bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const expireOldBookings = async () => {
    try {
      await fetch("/api/cron/expire-bookings", { method: "POST" });
    } catch (error) {
      console.error("Error expiring old bookings:", error);
    }
  };

  const updateBookingStatus = async (
    mobilId: string,
    bookingId: string,
    status: "completed" | "cancelled" | "expired",
    notes?: string
  ) => {
    try {
      const response = await fetch("/api/dashboard/test-drives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobilId,
          bookingId,
          status,
          notes,
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchBookings(); // Refresh data
        setShowDetailModal(false);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Gagal mengupdate status booking");
    }
  };

  const cancelBooking = async (mobilId: string, bookingId: string) => {
    if (!confirm("Yakin ingin membatalkan booking ini?")) return;

    try {
      const response = await fetch(
        `/api/dashboard/test-drives?mobilId=${mobilId}&bookingId=${bookingId}`,
        { method: "DELETE" }
      );

      const result = await response.json();
      if (result.success) {
        fetchBookings(); // Refresh data
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Gagal membatalkan booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "expired":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isBookingExpiringSoon = (booking: TestDriveBookingWithMobil) => {
    const testDate = new Date(booking.tanggalTest);
    const now = new Date();
    const diffHours = (testDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24 && booking.status === "active";
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm === "" ||
      booking.namaCustomer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.noHp.includes(searchTerm) ||
      booking.mobil.merek.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobil.tipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobil.noPol.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test Drive Management
            </h1>
            <p className="text-gray-600">
              Kelola booking test drive dengan monitoring real-time
            </p>
          </div>
          <button
            onClick={expireOldBookings}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            <Clock className="w-4 h-4" />
            Expire Old Bookings
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.expired}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.cancelled}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama customer, mobil, atau no polisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booked At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className={`hover:bg-gray-50 ${
                    isBookingExpiringSoon(booking) ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.namaCustomer}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.noHp}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.mobil.merek} {booking.mobil.tipe}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.mobil.tahun} • {booking.mobil.noPol}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {formatCurrency(booking.mobil.harga)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.tanggalTest)}
                    </div>
                    <div className="text-sm text-gray-500">{booking.waktu}</div>
                    {isBookingExpiringSoon(booking) && (
                      <div className="text-xs text-orange-600 font-medium mt-1">
                        ⚠️ Expires soon!
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(booking.createdAt))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {booking.status === "active" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(
                                booking.mobil._id,
                                booking._id,
                                "completed"
                              )
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Mark as completed"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              cancelBooking(booking.mobil._id, booking._id)
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Cancel booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <a
                        href={`https://wa.me/${booking.noHp.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                        title="WhatsApp customer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
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
                    onClick={() => setSearchTerm("")}
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
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateBookingStatus}
        />
      )}
    </div>
  );
};

// Booking Detail Modal Component
const BookingDetailModal = ({
  booking,
  onClose,
  onUpdateStatus,
}: {
  booking: TestDriveBookingWithMobil;
  onClose: () => void;
  onUpdateStatus: (
    mobilId: string,
    bookingId: string,
    status: "completed" | "cancelled" | "expired",
    notes?: string
  ) => void;
}) => {
  const [notes, setNotes] = useState(booking.notes || "");
  const [newStatus, setNewStatus] = useState<
    "completed" | "cancelled" | "expired"
  >("completed");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Booking Detail</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Nama Customer
                  </label>
                  <p className="text-gray-900">{booking.namaCustomer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    No HP
                  </label>
                  <p className="text-gray-900">{booking.noHp}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tanggal Test Drive
                  </label>
                  <p className="text-gray-900">
                    {formatDate(booking.tanggalTest)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Waktu
                  </label>
                  <p className="text-gray-900">{booking.waktu}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === "active"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : booking.status === "expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobil Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Mobil Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Mobil
                  </label>
                  <p className="text-gray-900">
                    {booking.mobil.merek} {booking.mobil.tipe} (
                    {booking.mobil.tahun})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    No Polisi
                  </label>
                  <p className="text-gray-900">{booking.mobil.noPol}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Harga
                  </label>
                  <p className="text-green-600 font-medium">
                    {formatCurrency(booking.mobil.harga)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Booking Date
                  </label>
                  <p className="text-gray-900">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(booking.createdAt))}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Data Source
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.source === "embedded"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.source === "embedded" ? "New System" : "Legacy"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Actions */}
          {booking.status === "active" && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Booking
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(
                        e.target.value as "completed" | "cancelled" | "expired"
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Tambahkan catatan..."
                  />
                </div>
                <button
                  onClick={() =>
                    onUpdateStatus(
                      booking.mobil._id,
                      booking._id,
                      newStatus,
                      notes
                    )
                  }
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          )}

          {/* Current Notes Display */}
          {booking.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {booking.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTestDriveManagement;
