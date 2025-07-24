import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Car,
  Percent,
  Scale,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top Section - Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {/* Free Garansi Mesin */}
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0">
              <Trophy className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">
                Free Garansi Mesin
              </h3>
              <p className="text-gray-400 text-sm">Garansi 1 Bulan</p>
            </div>
          </div>

          {/* Free Test Drive */}
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 relative">
              <Car className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />
              <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                FREE
              </div>
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">
                Free Test Drive
              </h3>
              <p className="text-gray-400 text-sm">Coba Mobil Sebelum Beli</p>
            </div>
          </div>

          {/* Free Antar */}
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0">
              <Percent className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">
                Free Antar (Jabodetabek)
              </h3>
              <p className="text-gray-400 text-sm">Siap antar sampai rumah</p>
            </div>
          </div>

          {/* Pengajuan Harga Kredit */}
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0">
              <Scale className="w-10 h-10 lg:w-12 lg:h-12 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-2">
                Pengajuan Harga Kredit
              </h3>
              <p className="text-gray-400 text-sm">Ajukan DP & Angsuran</p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* What's on Radja Auto Car */}
          <div>
            <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
              What's on Radja Auto Car?
            </h3>
            <ul className="space-y-2 lg:space-y-3">
              <li>
                <Link
                  href="/mobil/tersedia"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Unit Tersedia
                </Link>
              </li>
              <li>
                <Link
                  href="/mobil"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  List Seluruh Unit
                </Link>
              </li>
              <li>
                <Link
                  href="/mobil/terjual"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Unit Terjual
                </Link>
              </li>
              <li>
                <Link
                  href="/cara-beli"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Cara Beli
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular used car */}
          <div>
            <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
              Popular used car
            </h3>
            <ul className="space-y-2 lg:space-y-3">
              <li>
                <Link
                  href="/mobil/NISSAN/all/all"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Nissan
                </Link>
              </li>
              <li>
                <Link
                  href="/mobil/HONDA/all/all"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Honda
                </Link>
              </li>
              <li>
                <Link
                  href="/mobil/SUZUKI/all/all"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Suzuki
                </Link>
              </li>
              <li>
                <Link
                  href="/mobil/HYUNDAI/all/all"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Hyundai
                </Link>
              </li>
              <li>
                <Link
                  href="/mobil/TOYOTA/all/all"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  Toyota
                </Link>
              </li>
              <li>
                <Link
                  href="/mobil/BYD/all/all"
                  className="text-gray-400 hover:text-white transition-colors text-sm lg:text-base"
                >
                  BYD
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 order-1 lg:order-1">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black rounded-full flex items-center justify-center">
                <Image
                  src="/lambang bulat.png"
                  alt="Radja Auto Car"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <span className="text-lg lg:text-2xl font-bold">
                Radja Auto Car
              </span>
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-sm order-3 lg:order-2">
              © 2024 Radja Auto Car. All rights reserved
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 order-2 lg:order-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="https://wa.me/message/ZMGZZ3QCF2VCF1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
