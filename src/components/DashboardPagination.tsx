// src/components/DashboardPagination.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface DashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

const DashboardPagination: React.FC<DashboardPaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl
}) => {
  // Function to build URL with page parameter
  const buildUrl = (page: number) => {
    if (page === 1) {
      return baseUrl;
    }
    return `${baseUrl}?page=${page}`;
  };

  // Function to generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show pages 2, 3, 4, 5 and then dots
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show dots and then last 4 pages
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show dots, current page area, dots
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null; // Don't show pagination if only 1 page
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Page Info */}
      <div className="text-sm text-gray-600">
        Halaman <span className="font-medium">{currentPage}</span> dari{' '}
        <span className="font-medium">{totalPages}</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-1">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Link>
        ) : (
          <span className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-l-lg cursor-not-allowed">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={buildUrl(pageNum)}
                className={`flex items-center justify-center px-4 py-2 text-sm font-medium border-t border-b border-gray-300 transition-colors ${
                  isActive
                    ? 'text-white bg-blue-600 border-blue-600 hover:bg-blue-700'
                    : 'text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        ) : (
          <span className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-r-lg cursor-not-allowed">
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        )}
      </div>

      {/* Quick Jump (for many pages) */}
      {totalPages > 10 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Langsung ke:</span>
          <div className="flex space-x-1">
            {currentPage > 5 && (
              <Link
                href={buildUrl(1)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Halaman 1
              </Link>
            )}
            {currentPage < totalPages - 4 && (
              <Link
                href={buildUrl(totalPages)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Halaman {totalPages}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPagination;