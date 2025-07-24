// src/components/DashboardTableWithPagination.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MobilType } from "@/types/mobil";
import DashboardPagination from "@/components/DashboardPagination";
import Link from "next/link";

type Props = {
  data: MobilType[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  baseUrl: string;
  showStatusInfo?: boolean;
  statusFilter?: string;
};

export default function DashboardTableWithPagination({
  data,
  currentPage,
  totalPages,
  totalItems,
  baseUrl,
  showStatusInfo = false,
  statusFilter,
}: Props) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<MobilType[]>(data || []);

  useEffect(() => {
    const keyword = search.toLowerCase();
    const result = data.filter(
      (mobil) =>
        mobil.merek.toLowerCase().includes(keyword) ||
        mobil.tipe.toLowerCase().includes(keyword) ||
        mobil.noPol.toLowerCase().includes(keyword)
    );
    setFiltered(result);
  }, [search, data]);

  // Calculate pagination info
  const startItem = (currentPage - 1) * 15 + 1;
  const endItem = Math.min(currentPage * 15, totalItems);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header Info */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        {/* Status Info */}
        {showStatusInfo && statusFilter && (
          <div className="text-center mb-4">
            <span
              className={`inline-block px-4 py-2 rounded-xl text-white font-medium text-sm sm:text-base ${
                statusFilter === "tersedia" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              Filter:{" "}
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </span>
          </div>
        )}

        {/* Pagination Info */}
        <div className="text-center text-gray-600 text-sm mb-4">
          Menampilkan {startItem}-{endItem} dari {totalItems} data mobil
          {totalPages > 1 && (
            <span className="block sm:inline sm:ml-2">
              (Halaman {currentPage} dari {totalPages})
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="🔍 Cari berdasarkan merek, tipe, atau noPol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-sm text-sm"
            />
          </div>
        </div>

        {/* Search Results Info */}
        {search && (
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">
              {filtered.length} hasil ditemukan untuk "{search}"
            </span>
          </div>
        )}
      </div>

      {/* Table Container - Mobile Responsive */}
      <div className="overflow-x-auto">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merek
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tahun
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Polisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DP
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
              {filtered.length > 0 ? (
                filtered.map((mobil, index) => {
                  const actualIndex = search
                    ? index
                    : (currentPage - 1) * 15 + index;

                  return (
                    <tr key={mobil._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {actualIndex + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {mobil.merek}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {mobil.tipe}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mobil.tahun}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mobil.warna}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {mobil.noPol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp. {Number(mobil.dp).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            mobil.status === "tersedia"
                              ? "bg-green-100 text-green-800"
                              : mobil.status === "terjual"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {mobil.status
                            ? mobil.status.charAt(0).toUpperCase() +
                              mobil.status.slice(1)
                            : "Tidak Diketahui"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/detailmobil/${mobil._id}`}>
                          <button className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium transition-colors">
                            Lihat Detail
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      {search ? (
                        <>
                          <div className="text-4xl mb-2">🔍</div>
                          <div className="text-lg font-medium">
                            Tidak ada hasil untuk "{search}"
                          </div>
                          <div className="text-sm">
                            Coba kata kunci yang berbeda
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">📋</div>
                          <div className="text-lg font-medium">
                            Tidak ada data mobil
                          </div>
                          <div className="text-sm">
                            Belum ada mobil yang terdaftar
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {filtered.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filtered.map((mobil, index) => {
                const actualIndex = search
                  ? index
                  : (currentPage - 1) * 15 + index;

                return (
                  <div
                    key={mobil._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">
                            #{actualIndex + 1}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              mobil.status === "tersedia"
                                ? "bg-green-100 text-green-800"
                                : mobil.status === "terjual"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {mobil.status
                              ? mobil.status.charAt(0).toUpperCase() +
                                mobil.status.slice(1)
                              : "Tidak Diketahui"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {mobil.merek} {mobil.tipe}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {mobil.tahun} • {mobil.warna}
                        </p>
                      </div>
                      <Link href={`/dashboard/detailmobil/${mobil._id}`}>
                        <button className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                          Detail
                        </button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">No. Polisi:</span>
                        <p className="font-mono font-medium">{mobil.noPol}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">DP:</span>
                        <p className="font-medium">
                          Rp. {Number(mobil.dp).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                {search ? (
                  <>
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="text-lg font-medium">
                      Tidak ada hasil untuk "{search}"
                    </div>
                    <div className="text-sm">Coba kata kunci yang berbeda</div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📋</div>
                    <div className="text-lg font-medium">
                      Tidak ada data mobil
                    </div>
                    <div className="text-sm">
                      Belum ada mobil yang terdaftar
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination - Only show if not searching and has multiple pages */}
      {!search && totalPages > 1 && (
        <div className="px-4 py-6 bg-gray-50 border-t border-gray-200">
          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </div>
      )}

      {/* Additional Stats */}
      {!search && (
        <div className="px-4 py-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-lg font-bold text-gray-800">
                {totalItems}
              </div>
              <div className="text-xs text-gray-600">Total Mobil</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-lg font-bold text-gray-800">
                {totalPages}
              </div>
              <div className="text-xs text-gray-600">Total Halaman</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-lg font-bold text-gray-800">15</div>
              <div className="text-xs text-gray-600">Data per Halaman</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
