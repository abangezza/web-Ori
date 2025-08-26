// src/app/(admin)/dashboard/sidebar.tsx - UPDATED WITH CASH OFFERS
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ✅ UPDATED: Added Cash Offers menu item
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Mobil Tersedia", href: "/dashboard/mobil/tersedia", icon: "🚗" },
    { name: "Mobil Terjual", href: "/dashboard/mobil/terjual", icon: "✅" },
    { name: "Seluruh Mobil", href: "/dashboard/mobil", icon: "📋" },
    { name: "Test Drive", href: "/dashboard/booking-test-drive", icon: "🔑" },
    { name: "Customers", href: "/dashboard/customers", icon: "👥" },
    { name: "Cash Offers", href: "/dashboard/cash-offers", icon: "💰" }, // ✅ NEW MENU ITEM
    { name: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  ];

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden bg-orange-600 text-white p-2 rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        {!isMobileSidebarOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </button>

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed h-screen bg-orange-800 shadow-md flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 w-64 lg:w-60`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-orange-700">
          <div className="flex items-center justify-between lg:justify-center">
            <h2 className="text-white font-bold text-lg lg:text-center">
              Admin Panel
            </h2>
            {/* Close button - mobile only */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-white hover:text-orange-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col space-y-1 mt-6 px-3 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-black font-semibold bg-orange-200"
                  : "text-white hover:text-black hover:bg-orange-200"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-orange-700">
          <div className="text-xs text-orange-200 text-center">
            Radja Auto Car
            <br />
            Enhanced Dashboard
          </div>
        </div>
      </div>

      {/* Main content margin adjustment */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .main-content {
            margin-left: 240px;
          }
        }
      `}</style>
    </>
  );
}
