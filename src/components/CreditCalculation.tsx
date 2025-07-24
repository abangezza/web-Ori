// src/components/CreditCalculation.tsx
"use client";

import React from "react";
import { MobilType } from "@/types/mobil";

interface CreditCalculationProps {
  data: MobilType;
}

const CreditCalculation: React.FC<CreditCalculationProps> = ({ data }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
        <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
          Hitungan Kredit
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-4">
        <div className="space-y-2">
          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Dp (Down Payment):
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words font-semibold text-green-700">
              Rp.
              {typeof data.dp === "number"
                ? data.dp.toLocaleString("id-ID")
                : "0"}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Angsuran 4 tahun:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words font-semibold text-blue-700">
              Rp.
              {typeof data.angsuran_4_thn === "number"
                ? data.angsuran_4_thn.toLocaleString("id-ID")
                : "0"}
            </div>
          </div>

          <div className="border-b-2 border-gray-200 pb-2">
            <div className="text-black text-base font-normal font-['Inter'] mb-1">
              Angsuran 5 Tahun:
            </div>
            <div className="text-black text-base font-normal font-['Inter'] break-words font-semibold text-orange-700">
              Rp.
              {typeof data.angsuran_5_tahun === "number"
                ? data.angsuran_5_tahun.toLocaleString("id-ID")
                : "0"}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-x-16 gap-y-2">
        <div className="space-y-2">
          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Dp (Down Payment)
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              Rp.
              {typeof data.dp === "number"
                ? data.dp.toLocaleString("id-ID")
                : "0"}
            </span>
          </div>

          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Angsuran 5 Tahun
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              Rp.
              {typeof data.angsuran_5_tahun === "number"
                ? data.angsuran_5_tahun.toLocaleString("id-ID")
                : "0"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center border-b-2 border-gray-200 pb-1">
            <span className="w-48 text-black text-lg font-normal font-['Inter']">
              Angsuran 4 tahun
            </span>
            <span className="text-black text-lg font-normal font-['Inter'] mr-4">
              :
            </span>
            <span className="text-black text-lg font-normal font-['Inter']">
              Rp.
              {typeof data.angsuran_4_thn === "number"
                ? data.angsuran_4_thn.toLocaleString("id-ID")
                : "0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCalculation;
