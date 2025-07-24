// src/components/MobilCard.tsx
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

  /// Get main photo or fallback
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

  return (
    <div className="w-full max-w-xs mx-auto bg-zinc-300 border border-orange-400 rounded-2xl overflow-hidden drop-shadow-lg hover:scale-105 transition duration-300 ease-in-out shadow-lg hover:shadow-2xl shadow-gray-400/100 hover:shadow-orange-500">
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
  );
}
