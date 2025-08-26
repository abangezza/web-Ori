// src/components/MobilInteractionsTable.tsx - NEW COMPONENT
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface MobilInteraction {
  _id: string;
  customerName: string;
  customerPhone: string;
  activityType: "test_drive" | "simulasi_kredit" | "beli_cash" | "view_detail";
  timestamp: string;
  status?: string;
  details: any;
  source: "embedded" | "legacy";
}

interface MobilInteractionsTableProps {
  mobilId: string;
  mobilInfo: {
    merek: string;
    tipe: string;
    noPol: string;
  };
}

const MobilInteractionsTable: React.FC<MobilInteractionsTableProps> = ({
  mobilId,
  mobilInfo,
}) => {
  const [interactions, setInteractions] = useState<MobilInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [stats, setStats] = useState<any>({});

  const activityTypes = [
    {
      key: "all",
      label: "Semua Aktivitas",
      icon: Eye,
      color: "gray",
      count: 0,
    },
    {
      key: "test_drive",
      label: "Test Drive",
      icon: Calendar,
      color: "blue",
      count: 0,
    },
    {
      key: "simulasi_kredit",
      label: "Simulasi Kredit",
      icon: CreditCard,
      color: "orange",
      count: 0,
    },
    {
      key: "beli_cash",
      label: "Penawaran Cash",
      icon: DollarSign,
      color: "green",
      count: 0,
    },
    {
      key: "view_detail",
      label: "Lihat Detail",
      icon: Eye,
      color: "gray",
      count: 0,
    },
  ];

  useEffect(() => {
    fetchMobilInteractions();
  }, [mobilId]);

  const fetchMobilInteractions = async () => {
    try {
      setLoading(true);

      // Fetch mobil interactions from enhanced API
      const response = await fetch(`/api/mobil/${mobilId}/interactions`);
      const result = await response.json();

      if (result.success) {
        setInteractions(result.data.interactions || []);
        setStats(result.data.stats || {});
      } else {
        console.error("Failed to fetch mobil interactions:", result.error);
      }
    } catch (error) {
      console.error("Error fetching mobil interactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter interactions
  const filteredInteractions = interactions.filter((interaction) =>
    filter === "all" ? true : interaction.activityType === filter
  );

  // Update activity type counts
  const activityTypesWithCounts = activityTypes.map((type) => ({
    ...type,
    count:
      type.key === "all"
        ? interactions.length
        : interactions.filter((i) => i.activityType === type.key).length,
  }));

  const getActivityIcon = (activityType: string) => {
    const type = activityTypes.find((t) => t.key === activityType);
    return type?.icon || Eye;
  };

  const getActivityColor = (activityType: string) => {
    const type = activityTypes.find((t) => t.key === activityType);
    return type?.color || "gray";
  };

  const getStatusBadge = (interaction: MobilInteraction) => {
    if (interaction.activityType === "test_drive") {
      const status = interaction.details?.status || "active";
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "expired"
              ? "bg-red-100 text-red-800"
              : status === "cancelled"
              ? "bg-gray-100 text-gray-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
          {status === "expired" && <XCircle className="w-3 h-3 mr-1" />}
          {status === "cancelled" && <AlertCircle className="w-3 h-3 mr-1" />}
          {status === "active" && <Clock className="w-3 h-3 mr-1" />}
          {status === "completed"
            ? "Selesai"
            : status === "expired"
            ? "Expired"
            : status === "cancelled"
            ? "Dibatalkan"
            : "Aktif"}
        </span>
      );
    }

    if (interaction.activityType === "beli_cash") {
      const status = interaction.details?.status || "pending";
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            status === "accepted"
              ? "bg-green-100 text-green-800"
              : status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status === "accepted" && <CheckCircle className="w-3 h-3 mr-1" />}
          {status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
          {status === "pending" && <Clock className="w-3 h-3 mr-1" />}
          {status === "accepted"
            ? "Diterima"
            : status === "rejected"
            ? "Ditolak"
            : "Pending"}
        </span>
      );
    }

    return null;
  };

  const getInteractionDetails = (interaction: MobilInteraction) => {
    switch (interaction.activityType) {
      case "test_drive":
        return (
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(interaction.details?.tanggalTest).toLocaleDateString(
                  "id-ID"
                )}{" "}
                - {interaction.details?.waktu || "10:00-11:00"}
              </span>
            </div>
          </div>
        );

      case "simulasi_kredit":
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              DP: Rp {(interaction.details?.dp || 0).toLocaleString("id-ID")}
            </div>
            <div>Tenor: {interaction.details?.tenor || "4 tahun"}</div>
            <div>
              Angsuran: Rp{" "}
              {(interaction.details?.angsuran || 0).toLocaleString("id-ID")}
              /bulan
            </div>
          </div>
        );

      case "beli_cash":
        const discount = interaction.details?.persentaseDiskon || 0;
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              Tawaran: Rp{" "}
              {(interaction.details?.hargaTawaran || 0).toLocaleString("id-ID")}
            </div>
            <div className={discount > 9 ? "text-red-600" : "text-green-600"}>
              Diskon: {discount.toFixed(1)}%{discount > 9 && " (Auto-Rejected)"}
            </div>
          </div>
        );

      case "view_detail":
        return (
          <div className="text-sm text-gray-600">
            <div>Durasi: {interaction.details?.duration || 0} detik</div>
          </div>
        );

      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours === 0) {
        return "Baru saja";
      }
      return `${diffHours} jam yang lalu`;
    } else if (diffDays === 1) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString("id-ID");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Riwayat Interaksi Mobil
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {mobilInfo.merek} {mobilInfo.tipe} - {mobilInfo.noPol}
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <span className="text-2xl font-bold text-blue-600">
              {interactions.length}
            </span>
            <span className="text-sm text-gray-500 ml-1">total interaksi</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {activityTypesWithCounts.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setFilter(type.key)}
                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === type.key
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {type.label}
                <span className="ml-2 bg-white rounded-full px-2 py-1 text-xs font-semibold">
                  {type.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactions Table */}
      <div className="overflow-x-auto">
        {filteredInteractions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <div className="text-lg font-medium text-gray-500 mb-2">
              Belum ada interaksi
            </div>
            <div className="text-sm text-gray-400">
              {filter === "all"
                ? "Mobil ini belum pernah dilihat atau ada yang berinteraksi"
                : `Belum ada aktivitas ${activityTypes
                    .find((t) => t.key === filter)
                    ?.label?.toLowerCase()}`}
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Aktivitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detail Interaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInteractions.map((interaction) => {
                const IconComponent = getActivityIcon(interaction.activityType);
                const activityColor = getActivityColor(
                  interaction.activityType
                );

                return (
                  <tr key={interaction._id} className="hover:bg-gray-50">
                    {/* Customer & Activity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full bg-${activityColor}-100 flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`w-5 h-5 text-${activityColor}-600`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {interaction.customerName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {interaction.customerPhone}
                          </div>
                          <div className="text-xs text-gray-400">
                            {
                              activityTypes.find(
                                (t) => t.key === interaction.activityType
                              )?.label
                            }
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Interaction Details */}
                    <td className="px-6 py-4">
                      {getInteractionDetails(interaction)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(interaction)}
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <div>
                          <div>{formatTimestamp(interaction.timestamp)}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(interaction.timestamp).toLocaleString(
                              "id-ID"
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`https://wa.me/${interaction.customerPhone.replace(
                            /\D/g,
                            ""
                          )}?text=Halo ${interaction.customerName}, mengenai ${
                            mobilInfo.merek
                          } ${mobilInfo.tipe} ${mobilInfo.noPol}...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 flex items-center"
                          title="Hubungi via WhatsApp"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        {interaction.source === "embedded" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Baru
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      {interactions.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {
                  interactions.filter((i) => i.activityType === "view_detail")
                    .length
                }
              </div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {
                  interactions.filter(
                    (i) => i.activityType === "simulasi_kredit"
                  ).length
                }
              </div>
              <div className="text-xs text-gray-500">Simulasi Kredit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {
                  interactions.filter((i) => i.activityType === "test_drive")
                    .length
                }
              </div>
              <div className="text-xs text-gray-500">Test Drive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  interactions.filter((i) => i.activityType === "beli_cash")
                    .length
                }
              </div>
              <div className="text-xs text-gray-500">Cash Offers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilInteractionsTable;
