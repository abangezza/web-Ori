// src/components/DashboardTableWithPagination.tsx
'use client';

import React, { useEffect, useState } from "react";
import { MobilType } from "@/types/mobil";
import Th from "@/components/th";
import Tr from "@/components/tr";
import DashboardPagination from "@/components/DashboardPagination";

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
  statusFilter
}: Props) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<MobilType[]>(data || []);

  useEffect(() => {
    const keyword = search.toLowerCase();
    const result = data.filter((mobil) =>
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
    <div className="bg-white p-6 rounded shadow-lg">
      {/* Header Info */}
      <div className="mb-6">        
        {/* Status Info */}
        {showStatusInfo && statusFilter && (
          <div className="text-center mb-4">
            <span className={`inline-block px-4 py-2 rounded-xl text-white font-medium ${
              statusFilter === 'tersedia' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              Filter: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </span>
          </div>
        )}

        {/* Pagination Info */}
        <div className="text-center text-gray-600 text-sm">
          Menampilkan {startItem}-{endItem} dari {totalItems} data mobil
          {totalPages > 1 && (
            <span className="ml-2">
              (Halaman {currentPage} dari {totalPages})
            </span>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Cari berdasarkan merek, tipe, atau noPol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm"
        />
      </div>

      {/* Search Results Info */}
      {search && (
        <div className="text-center mb-4">
          <span className="text-sm text-gray-600">
            {filtered.length} hasil ditemukan untuk "{search}"
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <Th />
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((mobil, index) => {
                // Calculate actual index considering pagination
                const actualIndex = search 
                  ? index // If searching, use local index
                  : (currentPage - 1) * 15 + index; // If not searching, use paginated index
                
                return (
                  <Tr 
                    key={mobil._id} 
                    data={mobil} 
                    index={actualIndex} 
                  />
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  <div className="text-gray-500">
                    {search ? (
                      <>
                        <div className="text-4xl mb-2">🔍</div>
                        <div className="text-lg font-medium">Tidak ada hasil untuk "{search}"</div>
                        <div className="text-sm">Coba kata kunci yang berbeda</div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-2">📋</div>
                        <div className="text-lg font-medium">Tidak ada data mobil</div>
                        <div className="text-sm">Belum ada mobil yang terdaftar</div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Only show if not searching and has multiple pages */}
      {!search && totalPages > 1 && (
        <div className="mt-8">
          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </div>
      )}

      {/* Additional Stats */}
      {!search && (
        <div className="mt-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-800">{totalItems}</div>
              <div className="text-xs text-gray-600">Total Mobil</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-800">{totalPages}</div>
              <div className="text-xs text-gray-600">Total Halaman</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-800">15</div>
              <div className="text-xs text-gray-600">Data per Halaman</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}