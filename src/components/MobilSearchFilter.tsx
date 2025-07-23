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
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Merek Dropdown */}
          <div className="flex-1 min-w-0 w-full md:w-auto">
            <div className="relative">
              <select
                value={filters.merek}
                onChange={(e) => handleFilterChange("merek", e.target.value)}
                className="w-full appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-6 pl-2 py-2"
              >
                <option value="all">Merek</option>
                {merekOptions.map((merek) => (
                  <option key={merek} value={merek}>
                    {merek}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>

          {/* Transmisi Dropdown */}
          <div className="flex-1 min-w-0 w-full md:w-auto">
            <div className="relative">
              <select
                value={filters.transmisi}
                onChange={(e) =>
                  handleFilterChange("transmisi", e.target.value)
                }
                className="w-full appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-6 pl-2 py-2"
              >
                <option value="all">Transmisi</option>
                {transmisiOptions.map((transmisi) => (
                  <option key={transmisi} value={transmisi}>
                    {transmisi}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>

          {/* Tahun Dropdown */}
          <div className="flex-1 min-w-0 w-full md:w-auto">
            <div className="relative">
              <select
                value={filters.tahun}
                onChange={(e) => handleFilterChange("tahun", e.target.value)}
                className="w-full appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-6 pl-2 py-2"
              >
                <option value="all">Tahun</option>
                {tahunOptions.map((tahun) => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap text-sm w-full md:w-auto justify-center"
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
            Find cars
          </button>
        </div>

        {/* Quick Filter Tags - Mobile Only */}
        <div className="flex md:hidden flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 justify-center items-center">
          <button
            onClick={() => router.push("/mobil")}
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            Semua
          </button>
          <button
            onClick={() => router.push("/mobil/tersedia")}
            className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200 transition-colors"
          >
            Tersedia
          </button>
          <button
            onClick={() => router.push("/mobil/terjual")}
            className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors"
          >
            Terjual
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm hover:bg-orange-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
