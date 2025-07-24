"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface MobilSearchFilterProps {
  initialFilters?: {
    merek?: string;
    transmisi?: string;
    tahun?: string;
  };
}

export default function MobilSearchFilter({
  initialFilters = {},
}: MobilSearchFilterProps) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    merek: initialFilters.merek || "all",
    transmisi: initialFilters.transmisi || "all",
    tahun: initialFilters.tahun || "all",
  });

  const merekOptions = [
    "TOYOTA",
    "HONDA",
    "SUZUKI",
    "NISSAN",
    "MITSUBISHI",
    "DAIHATSU",
    "MAZDA",
    "HYUNDAI",
    "KIA",
    "FORD",
    "CHEVROLET",
    "ISUZU",
    "BMW",
    "MERCEDES-BENZ",
  ];

  const transmisiOptions = ["Manual", "Automatic", "Triptonic"];
  const tahunOptions = Array.from({ length: 30 }, (_, i) => 2024 - i);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    const { merek, transmisi, tahun } = filters;
    const searchPath = `/mobil/${merek}/${transmisi}/${tahun}`;
    router.push(searchPath);
  };

  const handleReset = () => {
    setFilters({
      merek: "all",
      transmisi: "all",
      tahun: "all",
    });
    router.push("/mobil");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 lg:mb-8">
        {/* Main Filter Section */}
        <div className="p-4 lg:p-6">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Merek Dropdown */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <select
                  value={filters.merek}
                  onChange={(e) => handleFilterChange("merek", e.target.value)}
                  className="w-full appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-8 pl-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <option value="all">Semua Merek</option>
                  {merekOptions.map((merek) => (
                    <option key={merek} value={merek}>
                      {merek}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-200"></div>

            {/* Transmisi Dropdown */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <select
                  value={filters.transmisi}
                  onChange={(e) =>
                    handleFilterChange("transmisi", e.target.value)
                  }
                  className="w-full appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-8 pl-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <option value="all">Semua Transmisi</option>
                  {transmisiOptions.map((transmisi) => (
                    <option key={transmisi} value={transmisi}>
                      {transmisi}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-200"></div>

            {/* Tahun Dropdown */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <select
                  value={filters.tahun}
                  onChange={(e) => handleFilterChange("tahun", e.target.value)}
                  className="w-full appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-8 pl-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <option value="all">Semua Tahun</option>
                  {tahunOptions.map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                className="w-4 h-4"
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
              Cari Mobil
            </button>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-4">
            {/* Filter Controls */}
            <div className="space-y-3">
              {/* Merek */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merek
                </label>
                <div className="relative">
                  <select
                    value={filters.merek}
                    onChange={(e) =>
                      handleFilterChange("merek", e.target.value)
                    }
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Semua Merek</option>
                    {merekOptions.map((merek) => (
                      <option key={merek} value={merek}>
                        {merek}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Transmisi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmisi
                </label>
                <div className="relative">
                  <select
                    value={filters.transmisi}
                    onChange={(e) =>
                      handleFilterChange("transmisi", e.target.value)
                    }
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Semua Transmisi</option>
                    {transmisiOptions.map((transmisi) => (
                      <option key={transmisi} value={transmisi}>
                        {transmisi}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Tahun */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun
                </label>
                <div className="relative">
                  <select
                    value={filters.tahun}
                    onChange={(e) =>
                      handleFilterChange("tahun", e.target.value)
                    }
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Semua Tahun</option>
                    {tahunOptions.map((tahun) => (
                      <option key={tahun} value={tahun}>
                        {tahun}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
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
                Cari
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Tags - Mobile */}
        <div className="lg:hidden border-t border-gray-100 p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => router.push("/mobil")}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              Semua
            </button>
            <button
              onClick={() => router.push("/mobil/tersedia")}
              className="px-3 py-1.5 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              Tersedia
            </button>
            <button
              onClick={() => router.push("/mobil/terjual")}
              className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors"
            >
              Terjual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
