// src/components/CashOffersDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Car,
  User,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  MessageSquare,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { CashOfferWithMobil, CashOfferStats } from "@/types/mobil";

/* =========================================================
   Helper WhatsApp (1 file saja)
   ========================================================= */

// Format angka ke Rupiah (aman juga jika input string "Rp 15.000.000")
const formatIDR = (v: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(
    typeof v === "string" ? Number(v.replace(/[^\d.-]/g, "")) || 0 : v || 0
  );

// Normalkan nomor HP Indonesia → 62xxxxxxxxxx
const normalizeMsisdnID = (raw: string) => {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits; // sudah format internasional lain
};

// Bangun teks WA sesuai template yang kamu minta
const buildCashOfferWAText = (params: {
  nama?: string;
  merek: string;
  tipe: string;
  tahun: string | number;
  hargaTawaran: number | string;
  agentName?: string; // opsional, default "Ezza"
}) => {
  const nama = (params.nama || "Kak").trim();
  const harga = formatIDR(params.hargaTawaran);
  const agent = (params.agentName || "Ezza").trim();

  const text =
    `Hallo ka ${nama}, perkenalkan Saya ${agent} dari Showroom Radja Auto Car, ` +
    `seblumnya kaka pernah menawar mobil ${params.merek} ${params.tipe} (${params.tahun}) ` +
    `dengan Harga ${harga}, ` +
    `Bagaimana kak?? apa masih berminat? atau ada kendala nih ka??`;

  return encodeURIComponent(text);
};

// URL WhatsApp final (pakai wa.me agar works di mobile & desktop)
const getCashOfferWAUrl = (opts: {
  phone: string;
  nama?: string;
  merek: string;
  tipe: string;
  tahun: string | number;
  hargaTawaran: number | string;
  agentName?: string;
}) => {
  const phone = normalizeMsisdnID(opts.phone);
  const text = buildCashOfferWAText({
    nama: opts.nama,
    merek: opts.merek,
    tipe: opts.tipe,
    tahun: opts.tahun,
    hargaTawaran: opts.hargaTawaran,
    agentName: opts.agentName,
  });
  return `https://wa.me/${phone}?text=${text}`;
};
/* ========================================================= */

const CashOffersDashboard = () => {
  const [offers, setOffers] = useState<CashOfferWithMobil[]>([]);
  const [stats, setStats] = useState<CashOfferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedOffer, setSelectedOffer] = useState<CashOfferWithMobil | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [statusFilter]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/dashboard/cash-offers?${params}`);
      const result = await response.json();

      if (result.success) {
        setOffers(result.data);
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching cash offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOfferStatus = async (
    mobilId: string,
    offerId: string,
    status: "accepted" | "rejected",
    notes?: string
  ) => {
    try {
      const response = await fetch("/api/dashboard/cash-offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobilId,
          offerId,
          status,
          notes,
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchOffers(); // Refresh data
        setShowDetailModal(false);
        alert(`Cash offer ${status} successfully!`);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error updating offer status:", error);
      alert("Gagal mengupdate status offer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDiscountColor = (discount: number) => {
    if (discount <= 3) return "text-green-600";
    if (discount <= 6) return "text-yellow-600";
    if (discount <= 9) return "text-orange-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  // Filter offers based on search
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      searchTerm === "" ||
      offer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.customerPhone.includes(searchTerm) ||
      offer.mobil.merek.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.mobil.tipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.mobil.noPol.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
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
              Cash Offers Management
            </h1>
            <p className="text-gray-600">
              Kelola penawaran cash dari customer dengan validasi otomatis
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span>Maksimal diskon 9% dari harga mobil</span>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Offers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Value
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Discount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageDiscount}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Potential Revenue
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.potentialRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Potential Loss
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.potentialLoss)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discount Range Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribution by Discount Range
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.byDiscountRange["0-3%"]}
                </div>
                <div className="text-sm text-gray-600">0-3% Discount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.byDiscountRange["3-6%"]}
                </div>
                <div className="text-sm text-gray-600">3-6% Discount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.byDiscountRange["6-9%"]}
                </div>
                <div className="text-sm text-gray-600">6-9% Discount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.byDiscountRange[">9%"]}
                </div>
                <div className="text-sm text-gray-600">&gt;9% Discount</div>
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
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offers Table */}
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
                  Offer Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOffers.map((offer) => (
                <tr key={offer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {offer.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {offer.customerPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {offer.mobil.merek} {offer.mobil.tipe}
                        </div>
                        <div className="text-sm text-gray-500">
                          {offer.mobil.tahun} • {offer.mobil.noPol}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          Harga: {formatCurrency(offer.mobil.harga)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(offer.hargaTawaran)}
                      </div>
                      <div
                        className={`text-sm font-medium ${getDiscountColor(
                          offer.persentaseDiskon
                        )}`}
                      >
                        -{offer.persentaseDiskon}% discount
                      </div>
                      <div className="text-xs text-gray-500">
                        Selisih: {formatCurrency(offer.selisihHarga)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        offer.status
                      )}`}
                    >
                      {getStatusIcon(offer.status)}
                      {offer.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(offer.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOffer(offer);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {offer.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateOfferStatus(
                                offer.mobil._id,
                                offer._id,
                                "accepted"
                              )
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Accept offer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateOfferStatus(
                                offer.mobil._id,
                                offer._id,
                                "rejected"
                              )
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Reject offer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* WA LINK DENGAN TEKS OTOMATIS */}
                      <a
                        href={getCashOfferWAUrl({
                          phone: offer.customerPhone,
                          nama: offer.customerName,
                          merek: offer.mobil.merek,
                          tipe: offer.mobil.tipe,
                          tahun: offer.mobil.tahun,
                          hargaTawaran: offer.hargaTawaran,
                          // agentName: "Ezza" // opsional, default "Ezza"
                        })}
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

          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Tidak Ada Hasil
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Tidak ditemukan offer dengan kata kunci "{searchTerm}"
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
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {statusFilter === "pending"
                      ? "Belum Ada Pending Offers"
                      : "Belum Ada Offers"}
                  </h3>
                  <p className="text-gray-500">
                    Cash offers akan muncul di sini
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Offer Detail Modal */}
      {showDetailModal && selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={updateOfferStatus}
        />
      )}
    </div>
  );
};

// Offer Detail Modal Component
const OfferDetailModal = ({
  offer,
  onClose,
  onUpdateStatus,
}: {
  offer: CashOfferWithMobil;
  onClose: () => void;
  onUpdateStatus: (
    mobilId: string,
    offerId: string,
    status: "accepted" | "rejected",
    notes?: string
  ) => void;
}) => {
  const [notes, setNotes] = useState(offer.notes || "");
  const [newStatus, setNewStatus] = useState<"accepted" | "rejected">(
    "accepted"
  );

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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getDiscountColor = (discount: number) => {
    if (discount <= 3) return "text-green-600";
    if (discount <= 6) return "text-yellow-600";
    if (discount <= 9) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Cash Offer Detail
            </h2>
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
            {/* Customer & Offer Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nama Customer
                    </label>
                    <p className="text-gray-900">{offer.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      No HP
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900">{offer.customerPhone}</p>
                      {/* WA LINK DENGAN TEKS OTOMATIS (di modal) */}
                      <a
                        href={getCashOfferWAUrl({
                          phone: offer.customerPhone,
                          nama: offer.customerName,
                          merek: offer.mobil.merek,
                          tipe: offer.mobil.tipe,
                          tahun: offer.mobil.tahun,
                          hargaTawaran: offer.hargaTawaran,
                          // agentName: "Ezza" // opsional
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                        title="WhatsApp customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Offer Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Harga Tawaran
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(offer.hargaTawaran)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Discount
                    </label>
                    <p
                      className={`text-lg font-bold ${getDiscountColor(
                        offer.persentaseDiskon
                      )}`}
                    >
                      -{offer.persentaseDiskon}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Selisih Harga
                    </label>
                    <p className="text-red-600 font-medium">
                      -{formatCurrency(offer.selisihHarga)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tanggal Offer
                    </label>
                    <p className="text-gray-900">
                      {formatDate(offer.timestamp)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        offer.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : offer.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : offer.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobil Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Mobil Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Mobil
                    </label>
                    <p className="text-gray-900">
                      {offer.mobil.merek} {offer.mobil.tipe} (
                      {offer.mobil.tahun})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      No Polisi
                    </label>
                    <p className="text-gray-900">{offer.mobil.noPol}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Harga Asli
                    </label>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(offer.mobil.harga)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Negotiation Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Analisis Penawaran
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Harga Mobil:</span>
                    <span>{formatCurrency(offer.mobil.harga)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tawaran Customer:</span>
                    <span className="text-green-600">
                      {formatCurrency(offer.hargaTawaran)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Potensi Keuntungan:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(offer.hargaTawaran * 0.8)}{" "}
                      {/* asumsi 80% cost */}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin Hilang:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(offer.selisihHarga)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Making */}
              {offer.status === "pending" && (
                <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">
                      Rekomendasi
                    </h4>
                  </div>
                  <p className="text-sm text-orange-800">
                    {offer.persentaseDiskon <= 5
                      ? "✅ Diskon dalam batas wajar, pertimbangkan untuk diterima"
                      : offer.persentaseDiskon <= 8
                      ? "⚠️ Diskon cukup tinggi, perlu negosiasi atau pertimbangan khusus"
                      : "❌ Diskon mendekati batas maksimal, pertimbangkan untuk negosiasi ulang"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions for Pending Offers */}
          {offer.status === "pending" && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Offer Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Keputusan
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as "accepted" | "rejected")
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="accepted">Terima Penawaran</option>
                    <option value="rejected">Tolak Penawaran</option>
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
                    placeholder="Alasan keputusan atau catatan negosiasi..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      onUpdateStatus(
                        offer.mobil._id,
                        offer._id,
                        "rejected",
                        notes
                      )
                    }
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Tolak Penawaran
                  </button>
                  <button
                    onClick={() =>
                      onUpdateStatus(
                        offer.mobil._id,
                        offer._id,
                        "accepted",
                        notes
                      )
                    }
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    Terima Penawaran
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Current Notes Display */}
          {offer.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {offer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashOffersDashboard;
