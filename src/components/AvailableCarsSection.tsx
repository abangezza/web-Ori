// src/components/AvailableCarsSection.tsx - Updated Mobile Grid
"use client";

import React, { useState, useEffect } from "react";
import MobilCard from "./MobilCard";
import { MobilType } from "@/types/mobil";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AvailableCarsSectionProps {
  title?: string;
  showTitle?: boolean;
  itemsPerPage?: number;
}

const AvailableCarsSection: React.FC<AvailableCarsSectionProps> = ({
  title = "Mobil Tersedia",
  showTitle = true,
  itemsPerPage = 8,
}) => {
  const [mobils, setMobils] = useState<MobilType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data mobil tersedia
  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/mobil/tersedia");

        if (!response.ok) {
          throw new Error("Gagal mengambil data mobil");
        }

        const data = await response.json();
        setMobils(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCars();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(mobils.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMobils = mobils.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);

    // Scroll ke bagian atas section "Mobil Tersedia" dengan delay untuk memastikan state sudah update
    setTimeout(() => {
      const section = document.getElementById("available-cars-section");
      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="w-full" id="available-cars-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showTitle && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{title}</h2>
            </div>
          )}

          {/* Loading Skeleton - Updated Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="w-full max-w-sm md:max-w-xs">
                <div className="bg-gray-200 animate-pulse rounded-2xl h-80 mb-4"></div>
                <div className="bg-gray-200 animate-pulse rounded h-4 mb-2"></div>
                <div className="bg-gray-200 animate-pulse rounded h-4 w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full" id="available-cars-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mobils.length === 0) {
    return (
      <div className="w-full" id="available-cars-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showTitle && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{title}</h2>
            </div>
          )}

          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Tidak ada mobil tersedia
            </h3>
            <p className="text-gray-500 mb-6">
              Saat ini tidak ada mobil yang tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50" id="available-cars-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {showTitle && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            <p className="text-sm text-gray-500">
              Menampilkan {startIndex + 1}-{Math.min(endIndex, mobils.length)}{" "}
              dari {mobils.length} mobil tersedia
            </p>
          </div>
        )}

        {/* Grid Cards - Mobile: 1 column, Desktop: up to 4 columns */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            {/* Mobile Grid: 1 column with full width cards */}
            <div className="grid grid-cols-1 md:hidden gap-6 justify-items-center mb-8">
              {currentMobils.map((mobil) => (
                <div key={mobil._id} className="w-full max-w-sm">
                  <MobilCard mobil={mobil} />
                </div>
              ))}
            </div>

            {/* Desktop Grid: 2-4 columns */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center mb-8">
              {currentMobils.map((mobil) => (
                <MobilCard key={mobil._id} mobil={mobil} />
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-2 mt-8">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300"
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex flex-wrap justify-center gap-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-3 py-2 text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => goToPage(page as number)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {/* Page Info */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailableCarsSection;
