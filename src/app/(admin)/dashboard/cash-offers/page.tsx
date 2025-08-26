// src/app/(admin)/dashboard/cash-offers/page.tsx - NEW PAGE
import React from "react";
import CashOffersDashboard from "@/components/CashOffersDashboard";

export default function CashOffersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Cash Offers Management
                </h1>
                <p className="mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
                  Kelola penawaran cash dari pelanggan dengan validasi 9%
                  otomatis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 sm:space-x-4">
            <li>
              <div className="flex items-center">
                <a
                  href="/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Dashboard
                </a>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </li>
            <li>
              <span className="text-sm text-gray-900 font-medium">
                Cash Offers
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Cash Offers Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CashOffersDashboard />
      </div>
    </div>
  );
}
