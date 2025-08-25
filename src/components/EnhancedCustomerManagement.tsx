// src/components/EnhancedCustomerManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Search,
  Filter,
  MessageSquare,
  Phone,
  Eye,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { PelangganType, CustomerStats } from "@/types/mobil";

const EnhancedCustomerManagement = () => {
  const [customers, setCustomers] = useState<PelangganType[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState<PelangganType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, priorityFilter, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/dashboard/customers?${params}`);
      const result = await response.json();

      if (result.success) {
        setCustomers(result.data);
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (
    customerId: string,
    newStatus: string,
    notes?: string
  ) => {
    try {
      const response = await fetch("/api/dashboard/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          status: newStatus,
          notes,
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchCustomers(); // Refresh data
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Error updating customer status:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hot Lead":
        return "bg-red-100 text-red-800";
      case "Interested":
        return "bg-blue-100 text-blue-800";
      case "Sudah Di Follow Up":
        return "bg-green-100 text-green-800";
      case "Purchased":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
              Enhanced Customer Management
            </h1>
            <p className="text-gray-600">
              Kelola data pelanggan dengan insight mendalam
            </p>
          </div>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <MessageSquare className="w-4 h-4" />
            Broadcast Message
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byStatus["Hot Lead"] || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Ready for Follow Up
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.readyForFollowUp}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Engagement
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageEngagement}%
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
              placeholder="Cari berdasarkan nama atau nomor HP..."
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
              <option value="Belum Di Follow Up">Belum Follow Up</option>
              <option value="Sudah Di Follow Up">Sudah Follow Up</option>
              <option value="Interested">Interested</option>
              <option value="Hot Lead">Hot Lead</option>
              <option value="Purchased">Purchased</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Semua Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quick Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.noHp}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                      {customer.priority && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                            customer.priority
                          )}`}
                        >
                          {customer.priority}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              customer.engagementScore || 0,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {customer.engagementScore || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(customer.lastActivity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {customer.summaryStats.totalViews}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {customer.summaryStats.totalTestDrives}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {customer.summaryStats.totalSimulasiKredit}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {customer.summaryStats.totalTawaranCash}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail
                      </button>
                      <a
                        href={`https://wa.me/${customer.noHp.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateCustomerStatus}
        />
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <BroadcastModal
          customers={customers}
          onClose={() => setShowBroadcastModal(false)}
        />
      )}
    </div>
  );
};

// Customer Detail Modal Component
const CustomerDetailModal = ({
  customer,
  onClose,
  onUpdateStatus,
}: {
  customer: PelangganType;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
}) => {
  const [newStatus, setNewStatus] = useState(customer.status);
  const [notes, setNotes] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view_detail":
        return <Eye className="w-4 h-4" />;
      case "test_drive":
        return <Calendar className="w-4 h-4" />;
      case "simulasi_kredit":
        return <CreditCard className="w-4 h-4" />;
      case "beli_cash":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "view_detail":
        return "Melihat Detail";
      case "test_drive":
        return "Test Drive";
      case "simulasi_kredit":
        return "Simulasi Kredit";
      case "beli_cash":
        return "Penawaran Cash";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Customer Detail</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Customer
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nama
                    </label>
                    <p className="text-gray-900">{customer.nama}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      No HP
                    </label>
                    <p className="text-gray-900">{customer.noHp}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Total Interaksi
                    </label>
                    <p className="text-gray-900">
                      {customer.totalInteractions}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Engagement Score
                    </label>
                    <p className="text-gray-900">
                      {customer.engagementScore || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Update Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Status Baru
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Belum Di Follow Up">
                        Belum Di Follow Up
                      </option>
                      <option value="Sudah Di Follow Up">
                        Sudah Di Follow Up
                      </option>
                      <option value="Interested">Interested</option>
                      <option value="Hot Lead">Hot Lead</option>
                      <option value="Purchased">Purchased</option>
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
                      onUpdateStatus(customer._id, newStatus, notes)
                    }
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>

            {/* Interaction History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Riwayat Interaksi
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {customer.interactionHistory.map((interaction, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(interaction.activityType)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {getActivityLabel(interaction.activityType)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {interaction.mobilInfo.merek}{" "}
                            {interaction.mobilInfo.tipe} (
                            {interaction.mobilInfo.tahun})
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(interaction.timestamp))}
                      </span>
                    </div>

                    {/* Activity Details */}
                    {interaction.details && (
                      <div className="mt-2 text-sm text-gray-600">
                        {interaction.activityType === "simulasi_kredit" && (
                          <p>
                            DP: {formatCurrency(interaction.details.dp || 0)},
                            Tenor: {interaction.details.tenor}
                          </p>
                        )}
                        {interaction.activityType === "beli_cash" && (
                          <p>
                            Tawaran:{" "}
                            {formatCurrency(
                              interaction.details.hargaTawaran || 0
                            )}
                          </p>
                        )}
                        {interaction.activityType === "test_drive" && (
                          <p>
                            Tanggal:{" "}
                            {interaction.details.tanggalTest
                              ? new Date(
                                  interaction.details.tanggalTest
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {customer.interactionHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Belum ada riwayat interaksi
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Broadcast Modal Component
const BroadcastModal = ({
  customers,
  onClose,
}: {
  customers: PelangganType[];
  onClose: () => void;
}) => {
  const [message, setMessage] = useState("");
  const [targetStatus, setTargetStatus] = useState("all");
  const [sending, setSending] = useState(false);

  const getTargetCount = () => {
    if (targetStatus === "all") return customers.length;
    return customers.filter((c) => c.status === targetStatus).length;
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, targetStatus }),
      });

      const result = await response.json();
      if (result.success) {
        alert(
          `Broadcast berhasil dikirim ke ${result.data.totalRecipients} customer`
        );
        onClose();
      }
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert("Gagal mengirim broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Broadcast Message
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Target Customer
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">Semua Customer ({customers.length})</option>
              <option value="Belum Di Follow Up">Belum Follow Up</option>
              <option value="Interested">Interested</option>
              <option value="Hot Lead">Hot Lead</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Akan dikirim ke {getTargetCount()} customer
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Pesan
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={4}
              placeholder="Tulis pesan broadcast..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {sending ? "Mengirim..." : "Kirim Broadcast"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCustomerManagement;
