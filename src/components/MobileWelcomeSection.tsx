// src/components/MobileWelcomeSection.tsx
"use client";

import React from "react";
import Image from "next/image";

interface MobileWelcomeSectionProps {
  mobilCount: number;
}

const MobileWelcomeSection: React.FC<MobileWelcomeSectionProps> = ({
  mobilCount,
}) => {
  const handleScrollToAvailableCars = () => {
    document.getElementById("available-cars")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-300 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="bg-black rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <Image
              src="/lambang bulat.png"
              alt="Radja Auto Car"
              className="w-12 h-12"
              width={32}
              height={32}
            />
          </div>
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Radja Auto Car
          </h1>
          <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-6 mb-10">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Selamat Datang di
            <span className="block text-orange-400">Radja Auto Car</span>
          </h2>

          <p className="text-lg text-gray-300 leading-relaxed max-w-md mx-auto">
            Temukan mobil impian Anda dengan koleksi terlengkap dan terpercaya.
            Kualitas terbaik, harga terjangkau, dan pelayanan prima.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
            <div className="text-2xl mb-2">🚗</div>
            <div className="text-white font-semibold text-sm">
              Mobil Berkualitas
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-white font-semibold text-sm">
              Harga Terjangkau
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
            <div className="text-2xl mb-2">🔧</div>
            <div className="text-white font-semibold text-sm">
              Service Terpercaya
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-white font-semibold text-sm">
              Pelayanan Prima
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <button
            onClick={handleScrollToAvailableCars}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl text-lg w-full max-w-xs mx-auto block"
          >
            Lihat Mobil Tersedia
          </button>

          <p className="text-gray-400 text-sm">
            {mobilCount} mobil tersedia untuk Anda
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-xs mb-2">Scroll ke bawah</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWelcomeSection;
