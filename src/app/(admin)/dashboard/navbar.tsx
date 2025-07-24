// 5. /src/components/Navbar.tsx (logout tombol)
"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-800 text-xl sm:text-2xl lg:text-3xl">
                <span className="hidden sm:inline">Radja Auto Car</span>
                <span className="sm:hidden">Radja</span>
              </span>
            </div>

            {/* Desktop Logout Button */}
            <div className="hidden sm:block">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer text-sm lg:text-base"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                LOGOUT
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {!isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <button
                className="block w-full text-left bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition cursor-pointer text-center font-medium"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                LOGOUT
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
