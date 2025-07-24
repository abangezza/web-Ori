// src/app/(customer)/detailmobilcs/[id]/MobilDetailClientcs.tsx - Updated Version
"use client";

import { MobilType } from "@/types/mobil";
import { FaGasPump, FaCalendarAlt, FaCarSide } from "react-icons/fa";
import { MdOutlineAvTimer } from "react-icons/md";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SimulasiKreditForm from "@/components/forms/SimulasiKreditForm";
import BeliCashForm from "@/components/forms/BeliCashForm";
import TestDriveBookingForm from "@/components/forms/TestDriveBookingForm";
import MobilImageAccordion from "@/components/MobilImageAccordion";
import MobilImageModal from "@/components/MobilImageModal";
import VehicleSpecifications from "@/components/VehicleSpecifications";
import VehicleDocuments from "@/components/VehicleDocuments";
import CreditCalculation from "@/components/CreditCalculation";

interface MobilDetailClientProps {
  data: MobilType;
}

export default function MobilDetailClient({ data }: MobilDetailClientProps) {
  const router = useRouter();
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Check if mobil is sold out
  const isSoldOut = data.status === "terjual";

  // Track view detail activity when component mounts
  useEffect(() => {
    const trackView = async () => {
      try {
        console.log("Tracking view for mobil:", data._id);

        const response = await fetch("/api/analytics/track-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobilId: data._id,
            timestamp: new Date().toISOString(),
          }),
        });

        const result = await response.json();
        console.log("Track view result:", result);

        if (!response.ok) {
          console.error("Failed to track view:", result);
        }
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [data._id]);

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

  // Image modal functions
  const openImageModal = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImageIndex(0);
  };

  const goToNextImage = () => {
    if (data.fotos && data.fotos.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === data.fotos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const goToPreviousImage = () => {
    if (data.fotos && data.fotos.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? data.fotos.length - 1 : prev - 1
      );
    }
  };

  const openDescriptionModal = () => {
    setShowDescriptionModal(true);
  };

  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
  };

  const handleBackToAvailableCars = () => {
    router.push("/mobil/tersedia");
  };

  const mobilName = `${data.merek} ${data.tipe} ${data.tahun}`;

  return (
    <div className="max-w-8xl mx-auto mt-20">
      {/* Photo Accordion/Swiper - Using the updated component */}
      <MobilImageAccordion
        fotos={data.fotos}
        mobilName={mobilName}
        onImageClick={openImageModal}
      />

      {/* Content with padding - Centered */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Judul dan Harga */}
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold break-words">{mobilName}</h1>
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSoldOut
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isSoldOut ? "SOLD OUT" : "TERSEDIA"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-lg text-gray-500 mb-2">
          <span className="flex items-center">
            <MdOutlineAvTimer
              size={30}
              color="#006400"
              className="inline mr-1"
            />
            <span className="break-all">{data.kilometer}</span>
          </span>
          <span className="flex items-center">
            <FaGasPump size={25} color="#006400" className="inline mr-1" />
            <span className="break-words">{data.bahan_bakar}</span>
          </span>
          <span className="flex items-center">
            <FaCarSide size={28} color="#006400" className="inline mr-1" />
            <span className="break-words">{data.transmisi}</span>
          </span>
          <span className="flex items-center">
            <FaCalendarAlt size={25} color="#006400" className="inline mr-1" />
            <span className="break-words">
              {formatTanggalPajak(data.pajak)}
            </span>
          </span>
        </div>
        <p className="text-orange-600 text-2xl font-bold mb-6 break-all">
          Rp.{data.harga.toLocaleString("id-ID")}
        </p>

        {/* Tombol */}
        <div className="mb-6">
          <button
            onClick={openDescriptionModal}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Deskripsi Unit
          </button>
        </div>

        {/* Detail Kendaraan - Mobile Optimized */}
        <div className="w-full max-w-full overflow-hidden bg-white rounded-[5px] border border-gray-200 p-4 md:p-6 mb-8">
          {/* Using the new components */}
          <VehicleSpecifications data={data} />
          <VehicleDocuments data={data} />
          <CreditCalculation data={data} />
        </div>

        {/* CONDITIONAL CONTENT BASED ON STATUS */}
        {isSoldOut ? (
          /* SOLD OUT MESSAGE - Mobile Optimized */
          <div className="w-full max-w-full bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 md:p-12 text-center mb-8 border-2 border-red-200">
            <div className="mb-6">
              <div className="text-4xl md:text-6xl mb-4">😢</div>
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-2 break-words">
                Yaahhh... Sayang banget
              </h2>
              <h3 className="text-xl md:text-2xl font-semibold text-red-500 mb-4 break-words">
                Mobil ini udah SOLD OUT...
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-8 break-words">
                Tapi jangan sedih, masih banyak mobil keren lainnya yang
                menunggu!
              </p>
            </div>

            <button
              onClick={handleBackToAvailableCars}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg w-full md:w-auto"
            >
              🚗 Cari Mobil Lain Yuk!
            </button>
          </div>
        ) : (
          /* FORMS FOR AVAILABLE CARS - Mobile Optimized */
          <div className="space-y-8">
            {/* Simulasi Kredit Form */}
            <div className="w-full overflow-hidden">
              <SimulasiKreditForm mobil={data} />
            </div>

            {/* Test Drive Booking Form */}
            <div className="w-full overflow-hidden">
              <TestDriveBookingForm mobil={data} />
            </div>

            {/* Beli Cash Form */}
            <div className="w-full overflow-hidden">
              <BeliCashForm mobil={data} />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Image Modal with Navigation - Using the component */}
      <MobilImageModal
        isOpen={showImageModal}
        fotos={data.fotos}
        currentImageIndex={selectedImageIndex}
        mobilName={mobilName}
        onClose={closeImageModal}
        onNext={goToNextImage}
        onPrevious={goToPreviousImage}
        onImageSelect={setSelectedImageIndex}
      />

      {/* Description Modal - Mobile Optimized */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Deskripsi Unit
              </h2>
              <button
                onClick={closeDescriptionModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Kendaraan:</h3>
                <p className="text-gray-600 break-words">{mobilName}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Deskripsi:</h3>
                <p className="text-gray-600 break-words">
                  {data.deskripsi ||
                    "Tidak ada deskripsi tersedia untuk kendaraan ini."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Spesifikasi Singkat:
                </h3>
                <ul className="text-gray-600 space-y-1">
                  <li className="break-words">• Transmisi: {data.transmisi}</li>
                  <li className="break-words">
                    • Bahan Bakar: {data.bahan_bakar}
                  </li>
                  <li className="break-words">
                    • Kapasitas Mesin: {data.kapasitas_mesin} cc
                  </li>
                  <li className="break-words">• Kilometer: {data.kilometer}</li>
                  <li className="break-words">• Warna: {data.warna}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Harga:</h3>
                <p className="text-orange-600 text-lg font-bold break-all">
                  Rp.{data.harga.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDescriptionModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
