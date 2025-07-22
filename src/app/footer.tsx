import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Car, Percent, Scale, whatsapp ,Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section - Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Free Garansi Mesin */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Trophy className="w-12 h-12 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Free Garansi Mesin</h3>
              <p className="text-gray-400 text-sm">Garansi 1 Bulan</p>
            </div>
          </div>

          {/* Free Test Drive */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 relative">
              <Car className="w-12 h-12 text-orange-500" />
              <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                SOLD OUT
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Free Test Drive</h3>
              <p className="text-gray-400 text-sm">Coba Mobil Sebelum Beli</p>
            </div>
          </div>

          {/* Free Antar */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Percent className="w-12 h-12 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Free Antar (Jabodetabek)</h3>
              <p className="text-gray-400 text-sm">Siap antar sampai rumah</p>
            </div>
          </div>

          {/* Pengajuan Harga Kredit */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Scale className="w-12 h-12 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Pengajuan Harga Kredit</h3>
              <p className="text-gray-400 text-sm">Ajukan DP & Angsuran</p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* What's on Radja Auto Car */}
          <div>
            <h3 className="text-xl font-semibold mb-6">What's on Radja Auto Car?</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/mobil/tersedia" className="text-gray-400 hover:text-white transition-colors">
                  Unit Tersedia
                </Link>
              </li>
              <li>
                <Link href="/mobil" className="text-gray-400 hover:text-white transition-colors">
                  List Seluruh Unit
                </Link>
              </li>
              <li>
                <Link href="/mobil/terjual" className="text-gray-400 hover:text-white transition-colors">
                  Unit Terjual
                </Link>
              </li>
              <li>
                <Link href="/carabeli" className="text-gray-400 hover:text-white transition-colors">
                  Cara Beli
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular used car */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Popular used car</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/mobil/NISSAN/all/all" className="text-gray-400 hover:text-white transition-colors">
                  Nissan
                </Link>
              </li>
              <li>
                <Link href="/mobil/HONDA/all/all" className="text-gray-400 hover:text-white transition-colors">
                  Honda
                </Link>
              </li>
              <li>
                <Link href="/mobil/SUZUKI/all/all" className="text-gray-400 hover:text-white transition-colors">
                  Suzuki
                </Link>
              </li>
              <li>
                <Link href="/mobil/HYUNDAI/all/all" className="text-gray-400 hover:text-white transition-colors">
                  Hyundai
                </Link>
              </li>
              <li>
                <Link href="/mobil/TOYOTA/all/all" className="text-gray-400 hover:text-white transition-colors">
                  Toyota
                </Link>
              </li>
              <li>
                <Link href="/mobil/BYD/all/all" className="text-gray-400 hover:text-white transition-colors">
                  BYD
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <Image
                  src="/Lambang bulat.png"
                  alt="Radja Auto Car"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <span className="text-2xl font-bold">Radja Auto Car</span>
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Radja Auto Car. All rights reserved
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="https://wa.me/message/ZMGZZ3QCF2VCF1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
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