// src/components/VehicleDocuments.tsx
"use client";

import React from "react";
import { MobilType } from "@/types/mobil";

interface VehicleDocumentsProps {
  data: MobilType;
}

const VehicleDocuments: React.FC<VehicleDocumentsProps> = ({ data }) => {
  // Format tanggal pajak ke format Indonesia
  const formatTanggalPajak = (tanggal: string) => {
    if (!tanggal) return "Tidak tersedia";

    const bulanIndonesia = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const date = new Date(tanggal);
    const hari = date.getDate();
    const bulan = bulanIndonesia[date.getMonth()];
    const tahun = date.getFullYear();

    return `${hari}-${bulan}-${tahun}`;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
        <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
          Dokumen Kendaraan
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-4">
        <div className="space-y-2">
          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Nomor Polisi:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-all">
              {data.noPol}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              STNK:
            </div>
            <div className="text-black text-base font-normal font-['Inter']">
              {data.STNK ? "Ada" : "Tidak Ada"}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              BPKB:
            </div>
            <div className="text-black text-base font-normal font-['Inter']">
              {data.BPKB ? "Ada" : "Tidak Ada"}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Warna:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words">
              {data.warna}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Masa Berlaku STNK:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words">
              {formatTanggalPajak(data.pajak)}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Faktur:
            </div>
            <div className="text-black text-base font-normal font-['Inter']">
              {data.Faktur ? "Ada" : "Tidak Ada"}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-x-16 gap-y-2">
        <div className="space-y-2">
          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Nomor Polisi
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.noPol}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              STNK
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.STNK ? "Ada" : "Tidak Ada"}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              BPKB
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.BPKB ? "Ada" : "Tidak Ada"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Warna
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.warna}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Masa Berlaku STNK
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {formatTanggalPajak(data.pajak)}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Faktur
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.Faktur ? "Ada" : "Tidak Ada"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDocuments;
