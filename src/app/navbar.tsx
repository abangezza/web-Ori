"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if current page is home/dashboard
  const isHomePage = pathname === "/";

  // Handle scroll effect - only on home page
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Mobil Tersedia", href: "/mobil/tersedia" },
    { name: "Cara Beli", href: "/cara-beli" },
    { name: "Cara Test Drive", href: "/cara-test-drive" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHomePage
          ? isScrolled
            ? "bg-white shadow-md backdrop-blur-sm"
            : "bg-transparent shadow-none backdrop-blur-xs"
          : "bg-white shadow-md" // Always white background on non-home pages
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Kiri: Logo dan nama brand - Fixed positioning */}
          <div
            className="flex items-center flex-shrink-0"
            style={{ marginLeft: "120px" }}
          >
            <div className="relative mr-4">
              {/* Background hitam bulat untuk logo */}
              <div
                className="bg-black rounded-full flex items-center justify-center"
                style={{ width: "48px", height: "48px" }}
              >
                <Image
                  className="relative z-10"
                  src="/lambang bulat.png"
                  alt="Radja Auto Car"
                  width={32}
                  height={32}
                  style={{ width: "32px", height: "32px" }}
                />
              </div>
            </div>
            <span
              className={`font-bold transition-colors duration-300 font-serif ${
                isHomePage
                  ? isScrolled
                    ? "text-gray-800"
                    : "text-white drop-shadow-lg"
                  : "text-gray-800" // Always dark text on non-home pages
              }`}
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "24px",
                letterSpacing: "0.5px",
              }}
            >
              Radja Auto Car
            </span>
          </div>

          {/* Tengah: Menu Navigation - Fixed positioning */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div
              className="hidden md:flex items-center"
              style={{ gap: "32px" }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-bold transition-colors duration-300 ${
                    pathname === item.href
                      ? isHomePage
                        ? isScrolled
                          ? "text-orange-600 font-semibold"
                          : "text-orange-400 font-semibold drop-shadow-lg"
                        : "text-orange-600 font-semibold" // Always orange for active on non-home
                      : isHomePage
                      ? isScrolled
                        ? "text-gray-700 hover:text-orange-600"
                        : "text-white hover:text-orange-300 drop-shadow-lg"
                      : "text-gray-700 hover:text-orange-600" // Always dark text on non-home
                  }`}
                  style={{
                    padding: "12px",
                    fontSize: "16px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Kanan: Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-300 ${
                isHomePage
                  ? isScrolled
                    ? "text-gray-700 hover:text-orange-600 hover:bg-gray-100"
                    : "text-white hover:text-orange-300 hover:bg-white hover:bg-opacity-10"
                  : "text-gray-700 hover:text-orange-600 hover:bg-gray-100" // Always dark on non-home
              }`}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon - berubah jadi X ketika menu terbuka */}
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
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
                  aria-hidden="true"
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

      {/* Mobile Menu - Conditional rendering */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div
            className={`px-2 pt-2 pb-3 space-y-1 ${
              isHomePage
                ? isScrolled
                  ? "bg-white shadow-lg"
                  : "bg-black bg-opacity-80 backdrop-blur-sm"
                : "bg-white shadow-lg" // Always white background on non-home pages
            }`}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)} // Tutup menu saat item diklik
                className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                  pathname === item.href
                    ? isHomePage
                      ? isScrolled
                        ? "text-orange-600 font-semibold bg-orange-50"
                        : "text-orange-400 font-semibold bg-white bg-opacity-10"
                      : "text-orange-600 font-semibold bg-orange-50" // Always orange active on non-home
                    : isHomePage
                    ? isScrolled
                      ? "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                      : "text-white hover:text-orange-300 hover:bg-white hover:bg-opacity-10"
                    : "text-gray-700 hover:text-orange-600 hover:bg-gray-50" // Always dark on non-home
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
