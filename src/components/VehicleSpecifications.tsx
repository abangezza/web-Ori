// src/components/VehicleSpecifications.tsx
"use client";

import React from "react";
import { MobilType } from "@/types/mobil";

interface VehicleSpecificationsProps {
  data: MobilType;
}

const VehicleSpecifications: React.FC<VehicleSpecificationsProps> = ({
  data,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
        <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
          Spesifikasi Kendaraan
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-4">
        <div className="space-y-2">
          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Merk:
            </div>
            <div className="text-black text-base font-normal font-['Outfit'] break-words">
              {data.merek}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Type:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words">
              {data.tipe}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Transmisi:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words">
              {data.transmisi}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Kapasitas Mesin (cc):
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words">
              {data.kapasitas_mesin} cc
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Bahan Bakar:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words">
              {data.bahan_bakar}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Odometer:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words">
              {data.kilometer}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Nomor Rangka:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-all text-sm leading-relaxed">
              {data.noRangka}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Nomor Mesin:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-all text-sm leading-relaxed">
              {data.noMesin}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-x-16 gap-y-2">
        {/* Left Column */}
        <div className="space-y-2">
          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Merk
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Outfit']">
              {data.merek}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Transmisi
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.transmisi}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Bahan Bakar
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.bahan_bakar}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Nomor Rangka
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.noRangka}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Type
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.tipe}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Kapasitas Mesin (cc)
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.kapasitas_mesin} cc
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Odometer
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.kilometer}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Nomor Mesin
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              {data.noMesin}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSpecifications;
