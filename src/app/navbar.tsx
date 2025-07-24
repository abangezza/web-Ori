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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Mobil Tersedia", href: "/mobil/tersedia" },
    { name: "Cara Beli", href: "/cara-beli" },
    { name: "Cara Test Drive", href: "/cara-test-drive" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHomePage
            ? isScrolled
              ? "bg-white shadow-md backdrop-blur-sm"
              : "bg-transparent shadow-none backdrop-blur-xs"
            : "bg-white shadow-md"
        }`}
      >
        {/* Max width container to center content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo dan Brand */}
            <div className="flex items-center flex-shrink-0">
              <div className="relative mr-2 sm:mr-3">
                {/* Background hitam bulat untuk logo */}
                <div
                  className="bg-black rounded-full flex items-center justify-center"
                  style={{ width: "32px", height: "32px" }}
                >
                  <Image
                    className="relative z-10"
                    src="/lambang bulat.png"
                    alt="Radja Auto Car"
                    width={20}
                    height={20}
                    style={{ width: "20px", height: "20px" }}
                  />
                </div>
              </div>
              <span
                className={`font-bold transition-colors duration-300 font-serif text-sm sm:text-base lg:text-lg ${
                  isHomePage
                    ? isScrolled
                      ? "text-gray-800"
                      : "text-white drop-shadow-lg"
                    : "text-gray-800"
                }`}
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  letterSpacing: "0.5px",
                }}
              >
                <span className="hidden sm:inline">Radja Auto Car</span>
                <span className="sm:hidden">Radja Auto</span>
              </span>
            </div>

            {/* Navigation Menu - Desktop */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-colors duration-300 px-2 py-1 rounded-md text-sm xl:text-base ${
                    pathname === item.href
                      ? isHomePage
                        ? isScrolled
                          ? "text-orange-600 font-semibold bg-orange-50"
                          : "text-orange-400 font-semibold drop-shadow-lg bg-white bg-opacity-10"
                        : "text-orange-600 font-semibold bg-orange-50"
                      : isHomePage
                      ? isScrolled
                        ? "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                        : "text-white hover:text-orange-300 drop-shadow-lg hover:bg-white hover:bg-opacity-10"
                      : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                  }`}
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  <span className="xl:hidden">
                    {item.name === "Mobil Tersedia"
                      ? "Mobil"
                      : item.name === "Cara Test Drive"
                      ? "Test Drive"
                      : item.name}
                  </span>
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-300 ${
                  isHomePage
                    ? isScrolled
                      ? "text-gray-700 hover:text-orange-600 hover:bg-gray-100"
                      : "text-white hover:text-orange-300 hover:bg-white hover:bg-opacity-10"
                    : "text-gray-700 hover:text-orange-600 hover:bg-gray-100"
                }`}
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
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
      </nav>

      {/* Mobile Menu - Full screen overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile menu panel */}
          <div
            className="fixed top-16 left-0 right-0 z-50 lg:hidden"
            id="mobile-menu"
          >
            <div className="max-w-7xl mx-auto">
              <div
                className={`mx-4 rounded-xl shadow-lg overflow-hidden ${
                  isHomePage
                    ? isScrolled
                      ? "bg-white"
                      : "bg-gray-900 bg-opacity-95 backdrop-blur-sm"
                    : "bg-white"
                }`}
              >
                <div className="px-4 pt-4 pb-6 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-300 ${
                        pathname === item.href
                          ? isHomePage
                            ? isScrolled
                              ? "text-orange-600 font-semibold bg-orange-50"
                              : "text-orange-400 font-semibold bg-white bg-opacity-10"
                            : "text-orange-600 font-semibold bg-orange-50"
                          : isHomePage
                          ? isScrolled
                            ? "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                            : "text-white hover:text-orange-300 hover:bg-white hover:bg-opacity-10"
                          : "text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
