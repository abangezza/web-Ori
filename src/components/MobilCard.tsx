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
      // ✅ Gunakan API route untuk serve images
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
    <div className="w-full max-w-xs bg-zinc-300 border border-orange-400 rounded-2xl overflow-hidden drop-shadow-lg hover:scale-105 transition duration-300 ease-in-out shadow-lg hover:shadow-2xl shadow-gray-400/100 hover:shadow-orange-500">
      {/* Gambar - Fixed Height */}
      <div className="relative w-full h-44">
        <Image
          src={getMainPhoto()}
          alt={`${mobil.merek} ${mobil.tipe}`}
          fill
          className="object-cover"
        />

        {/* Status dan Tahun Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
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

      {/* Content - Compact Padding */}
      <div className="p-3">
        {/* Merek */}
        <h3 className="text-orange-800 text-lg font-serif font-semibold">
          {mobil.merek}
        </h3>

        {/* Tipe dan Transmisi */}
        <h2 className="text-lg font-medium truncate text-gray-800">
          {mobil.tipe} • {mobil.transmisi}
        </h2>

        {/* Spesifikasi - Compact Version */}
        <div className="mt-2 text-gray-800 font-semibold">
          <div className="flex flex-col gap-1 text-sm">
            <span>🚗 {mobil.kilometer}</span>
            <span>⛽ {mobil.bahan_bakar}</span>
            <span>📅 {formatTanggalPajak(mobil.pajak)}</span>
          </div>
        </div>

        {/* Harga */}
        <div className="mt-3 text-orange-500 text-lg font-bold">
          Rp.{formatHarga(mobil.harga)}
        </div>

        {/* Button */}
        <div className="mt-3 border-t pt-3">
          <Link href={`/detailmobilcs/${mobil._id}`}>
            <button className="w-full border border-black px-3 py-2 rounded-full hover:bg-orange-500 hover:text-white transition text-sm">
              Lihat Detail
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
