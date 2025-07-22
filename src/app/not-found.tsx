// src/components/NotFound.tsx
import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, Car } from 'lucide-react';

interface NotFoundProps {
  title?: string;
  description?: string;
  showSearchButton?: boolean;
  customHomeLink?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  title = "Halaman Tidak Ditemukan",
  description = "Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah dipindahkan atau dihapus.",
  showSearchButton = true,
  customHomeLink = "/"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-6 shadow-lg animate-bounce">
              <Car className="w-16 h-16 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            {title}
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link 
              href={customHomeLink}
              className="group inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 group-hover:animate-pulse" />
              Kembali ke Beranda
            </Link>

            <Link 
              href="/mobil"
              className="group inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Car className="w-5 h-5 group-hover:animate-pulse" />
              Lihat Mobil
            </Link>

            {showSearchButton && (
              <Link 
                href="/mobil/tersedia"
                className="group inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5 group-hover:animate-pulse" />
                Cari Mobil
              </Link>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Yang Bisa Anda Lakukan:
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                  <Home className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Kembali ke Beranda</h4>
                  <p className="text-sm text-gray-600">Mulai dari halaman utama</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <Car className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Jelajahi Mobil</h4>
                  <p className="text-sm text-gray-600">Lihat koleksi mobil kami</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                  <Search className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Cari Mobil</h4>
                  <p className="text-sm text-gray-600">Temukan mobil yang tersedia</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Kembali</h4>
                  <p className="text-sm text-gray-600">Gunakan tombol back browser</p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Footer */}
          <div className="mt-8 flex items-center justify-center gap-3 text-gray-500">
            <div className="bg-black rounded-full p-2">
              <img
                src="/Lambang bulat.png"
                alt="Radja Auto Car"
                className="w-6 h-6"
              />
            </div>
            <span className="font-medium text-lg" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Radja Auto Car
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;