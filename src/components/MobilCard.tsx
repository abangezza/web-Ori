// src/components/MobilCard.tsx - Updated Mobile Version
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MobilType } from "@/types/mobil";

interface MobilCardProps {
  mobil: MobilType;
}

export default function MobilCard({ mobil }: MobilCardProps) {
  // Format harga ke format Indonesia
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID").format(harga);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "tersedia":
        return "bg-green-600";
      case "terjual":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  // Get main photo or fallback
  const getMainPhoto = () => {
    if (mobil.fotos && mobil.fotos.length > 0) {
      return `/api/uploads/${mobil.fotos[0]}`;
    }
    return "/lambang 1.png"; // fallback image
  };

  // Format tanggal pajak ke format Indonesia
  const formatTanggalPajak = (tanggal: string) => {
    if (!tanggal) return "Tidak tersedia";

    const bulanIndonesia = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const date = new Date(tanggal);
    const hari = date.getDate();
    const bulan = bulanIndonesia[date.getMonth()];
    const tahun = date.getFullYear();

    return `${hari}-${bulan}-${tahun}`;
  };

  // Format transmisi
  const formatTransmisi = (transmisi: string) => {
    if (
      transmisi?.toLowerCase().includes("automatic") ||
      transmisi?.toLowerCase().includes("at")
    ) {
      return "AT";
    }
    if (
      transmisi?.toLowerCase().includes("manual") ||
      transmisi?.toLowerCase().includes("mt")
    ) {
      return "MT";
    }
    return transmisi || "N/A";
  };

  // Format kilometer
  const formatKilometer = (km: number) => {
    if (typeof km === "string") return km;
    return km?.toLocaleString("id-ID") || "0";
  };

  // Format currency short
  const formatCurrencyShort = (amount: number) => {
    if (!amount) return "0";
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}Jt`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString("id-ID");
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="block md:hidden w-full max-w-sm mx-auto bg-white border border-orange-400 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Gambar */}
        <div className="relative w-full h-48">
          <Image
            src={getMainPhoto()}
            alt={`${mobil.merek} ${mobil.tipe}`}
            fill
            className="object-cover"
            sizes="100vw"
          />

          {/* Status dan Tahun Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span
              className={`${getStatusColor(
                mobil.status
              )} text-white text-xs font-bold px-3 py-1 rounded-full capitalize`}
            >
              {mobil.status}
            </span>
            <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {mobil.tahun}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Merek & Tipe */}
          <div className="mb-4">
            <h3 className="text-orange-800 text-xl font-serif font-semibold mb-1">
              {mobil.merek}
            </h3>
            <h2 className="text-lg font-medium text-gray-800">{mobil.tipe}</h2>
          </div>

          {/* Info Mobil Table */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center border-b pb-2">
              📋 INFO MOBIL
            </h4>

            {/* Row 1: Kilometer, Transmisi, Pajak */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-blue-600 text-lg mb-1">🏃‍♂️</div>
                <div className="text-xs text-gray-600 mb-1">Kilometer</div>
                <div className="text-xs font-semibold text-gray-800 break-words">
                  {formatKilometer(mobil.kilometer)}
                </div>
              </div>

              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-green-600 text-lg mb-1">⚙️</div>
                <div className="text-xs text-gray-600 mb-1">Transmisi</div>
                <div className="text-xs font-semibold text-gray-800">
                  {formatTransmisi(mobil.transmisi)}
                </div>
              </div>

              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-red-600 text-lg mb-1">📅</div>
                <div className="text-xs text-gray-600 mb-1">Pajak</div>
                <div className="text-xs font-semibold text-gray-800 break-words">
                  {formatTanggalPajak(mobil.pajak)}
                </div>
              </div>
            </div>

            {/* Row 2: DP, Angsuran 4th, Angsuran 5th */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-lg mb-1">💰</div>
                <div className="text-xs text-gray-600 mb-1">DP</div>
                <div className="text-xs font-semibold text-blue-800 break-words">
                  {formatCurrencyShort(mobil.dp)}
                </div>
              </div>

              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-green-600 text-lg mb-1">📊</div>
                <div className="text-xs text-gray-600 mb-1">4 Tahun</div>
                <div className="text-xs font-semibold text-green-800 break-words">
                  {formatCurrencyShort(mobil.angsuran_4_thn)}
                </div>
              </div>

              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-orange-600 text-lg mb-1">📈</div>
                <div className="text-xs text-gray-600 mb-1">5 Tahun</div>
                <div className="text-xs font-semibold text-orange-800 break-words">
                  {formatCurrencyShort(mobil.angsuran_5_tahun)}
                </div>
              </div>
            </div>
          </div>

          {/* Harga */}
          <div className="mb-4 text-center">
            <div className="text-xl font-bold text-orange-500 break-all">
              Rp.{formatHarga(mobil.harga)}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-300 mb-4" />

          {/* Button */}
          <Link href={`/detailmobilcs/${mobil._id}`}>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-full transition-colors duration-200">
              👁️ Lihat Detail
            </button>
          </Link>
        </div>
      </div>

      {/* Desktop Layout (unchanged) */}
      <div className="hidden md:block w-full max-w-xs mx-auto bg-zinc-300 border border-orange-400 rounded-2xl overflow-hidden drop-shadow-lg hover:scale-105 transition duration-300 ease-in-out shadow-lg hover:shadow-2xl shadow-gray-400/100 hover:shadow-orange-500">
        {/* Gambar - Responsive Height */}
        <div className="relative w-full h-40 sm:h-44 md:h-48">
          <Image
            src={getMainPhoto()}
            alt={`${mobil.merek} ${mobil.tipe}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Status dan Tahun Badges */}
          <div className="absolute top-2 left-2 flex flex-col sm:flex-row gap-1">
            <span
              className={`${getStatusColor(
                mobil.status
              )} text-white text-xs font-bold px-2 py-1 rounded-full capitalize`}
            >
              {mobil.status}
            </span>
            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {mobil.tahun}
            </span>
          </div>
        </div>

        {/* Content - Responsive Padding */}
        <div className="p-3 sm:p-4">
          {/* Merek */}
          <h3 className="text-orange-800 text-lg sm:text-xl font-serif font-semibold truncate">
            {mobil.merek}
          </h3>

          {/* Tipe dan Transmisi */}
          <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
            <span className="block sm:inline truncate">{mobil.tipe}</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline text-sm sm:text-base text-gray-600">
              {mobil.transmisi}
            </span>
          </h2>

          {/* Spesifikasi - Responsive Layout */}
          <div className="mt-2 text-gray-800 font-semibold">
            <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm">
              <div className="flex items-center">
                <span className="mr-1">🚗</span>
                <span className="truncate">{mobil.kilometer}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">⛽</span>
                <span className="truncate">{mobil.bahan_bakar}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">📅</span>
                <span className="truncate">
                  {formatTanggalPajak(mobil.pajak)}
                </span>
              </div>
            </div>
          </div>

          {/* Harga - Responsive Text Size */}
          <div className="mt-3 text-orange-500 font-bold">
            <div className="text-base sm:text-lg md:text-xl">
              Rp.{formatHarga(mobil.harga)}
            </div>
          </div>

          {/* Button - Full Width on Small Screens */}
          <div className="mt-3 border-t pt-3">
            <Link href={`/detailmobilcs/${mobil._id}`}>
              <button className="w-full border border-black px-3 py-2 rounded-full hover:bg-orange-500 hover:text-white transition text-xs sm:text-sm font-medium">
                Lihat Detail
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
