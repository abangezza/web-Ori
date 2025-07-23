"use client";

import { MobilType } from "@/types/mobil";
import { FaGasPump, FaCalendarAlt, FaCarSide } from "react-icons/fa";
import { MdOutlineAvTimer } from "react-icons/md";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SimulasiKreditForm from "@/components/forms/SimulasiKreditForm";
import BeliCashForm from "@/components/forms/BeliCashForm";
import TestDriveBookingForm from "@/components/forms/TestDriveBookingForm";
import Image from "next/image";

interface MobilDetailClientProps {
  data: MobilType;
}

export default function MobilDetailClient({ data }: MobilDetailClientProps) {
  const router = useRouter();
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Changed from selectedImage to index

  // Check if mobil is sold out
  const isSoldOut = data.status === "terjual";

  // Track view detail activity when component mounts
  useEffect(() => {
    const trackView = async () => {
      try {
        console.log("Tracking view for mobil:", data._id); // Debug log

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
        console.log("Track view result:", result); // Debug log

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

  // Updated image modal functions
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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      goToNextImage();
    } else if (e.key === "ArrowLeft") {
      goToPreviousImage();
    } else if (e.key === "Escape") {
      closeImageModal();
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

  return (
    <div className="max-w-8xl mx-auto">
      {/* Photo Accordion - Full Width */}
      <div className="mb-6">
        <style jsx>{`
          .accordion-container {
            display: flex;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            min-height: 420px;
            background: white;
            padding: 0 8px 8px 8px;
            border-radius: 0 0 16px 16px;
            margin: 60px;
            margin-top: 120px;
          }

          .accordion-item {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: flex 0.5s ease-in-out;
            flex: 0.5;
            margin: 0 4px;
            border-radius: 9px 9px 9px 9px;
          }

          .accordion-item:first-child {
            margin-left: 0;
          }

          .accordion-item:last-child {
            margin-right: 0;
          }

          .accordion-item:hover {
            flex: 2;
          }

          .accordion-image {
            width: 100%;
            height: 420px;
            object-fit: cover;
            transition: transform 0.5s ease;
            border-radius: 0 0 12px 12px;
          }

          .accordion-item:hover .accordion-image {
            transform: scale(1.1);
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0);
            transition: background 0.3s ease;
          }

          .accordion-item:hover .image-overlay {
            background: rgba(0, 0, 0, 0.2);
          }

          .zoom-icon {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            padding: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .accordion-item:hover .zoom-icon {
            opacity: 1;
          }

          .zoom-icon:hover {
            background: rgba(255, 255, 255, 0.9);
          }

          .image-number {
            position: absolute;
            bottom: 16px;
            left: 16px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 500;
          }
        `}</style>

        <div className="accordion-container">
          {data.fotos && data.fotos.length > 0 ? (
            data.fotos.map((foto, i) => (
              <div
                key={i}
                className="accordion-item"
                onClick={() => openImageModal(i)}
              >
                <Image
                  src={`/api/uploads/${foto}`}
                  alt={`Foto ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() =>
                    console.error(
                      "Error loading image:",
                      `/api/uploads/${foto}`
                    )
                  }
                />

                <div className="image-overlay" />

                <div className="zoom-icon">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>

                <div className="image-number">{i + 1}</div>
              </div>
            ))
          ) : (
            <div
              style={{
                width: "100%",
                height: "420px",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#6b7280" }}>Tidak ada foto tersedia</p>
            </div>
          )}
        </div>

        <div className="text-center mt-3">
          <span className="text-sm text-gray-500">
            {data.fotos?.length || 0} foto tersedia - Klik untuk memperbesar
          </span>
        </div>
      </div>

      {/* Content with padding - Centered */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Judul dan Harga */}
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold">
            {data.merek} {data.tipe} {data.tahun}
          </h1>
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

        <div className="flex items-center gap-4 text-lg text-gray-500 mb-2">
          <span>
            <MdOutlineAvTimer
              size={30}
              color="#006400"
              className="inline mr-1"
            />{" "}
            {data.kilometer}
          </span>
          <span>
            <FaGasPump size={25} color="#006400" className="inline mr-1" />{" "}
            {data.bahan_bakar}
          </span>
          <span>
            <FaCarSide size={28} color="#006400" className="inline mr-1" />{" "}
            {data.transmisi}
          </span>
          <span>
            <FaCalendarAlt size={25} color="#006400" className="inline mr-1" />{" "}
            {formatTanggalPajak(data.pajak)}
          </span>
        </div>
        <p className="text-orange-600 text-2xl font-bold mb-6">
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

        {/* Detail Kendaraan */}
        <div className="w-full max-w-[1110px] h-auto relative bg-white rounded-[5px] border border-gray-200 p-6 mb-8">
          {/* Spesifikasi Kendaraan */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
              <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
                Spesifikasi Kendaraan
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
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

          {/* Dokumen Kendaraan */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
              <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
                Dokumen Kendaraan
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
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

          {/* Hitungan Kredit */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
              <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
                Hitungan Kredit
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
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
        </div>

        {/* CONDITIONAL CONTENT BASED ON STATUS */}
        {isSoldOut ? (
          /* SOLD OUT MESSAGE */
          <div className="w-full max-w-[1110px] bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-12 text-center mb-8 border-2 border-red-200">
            <div className="mb-6">
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-3xl font-bold text-red-600 mb-2">
                Yaahhh... Sayang banget
              </h2>
              <h3 className="text-2xl font-semibold text-red-500 mb-4">
                Mobil ini udah SOLD OUT...
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Tapi jangan sedih, masih banyak mobil keren lainnya yang
                menunggu!
              </p>
            </div>

            <button
              onClick={handleBackToAvailableCars}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚗 Cari Mobil Lain Yuk!
            </button>
          </div>
        ) : (
          /* FORMS FOR AVAILABLE CARS */
          <div className="space-y-8">
            {/* Simulasi Kredit Form */}
            <SimulasiKreditForm mobil={data} />

            {/* Test Drive Booking Form */}
            <TestDriveBookingForm mobil={data} />

            {/* Beli Cash Form */}
            <BeliCashForm mobil={data} />
          </div>
        )}
      </div>

      {/* Enhanced Image Modal with Navigation */}
      {showImageModal && data.fotos && data.fotos.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-20 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 transition-all duration-200 shadow-lg border-2 border-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Back Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 left-4 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              ← Kembali
            </button>

            {/* Previous Button */}
            {data.fotos.length > 1 && (
              <button
                onClick={goToPreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {data.fotos.length > 1 && (
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Main Image */}
            <div className="relative max-w-full max-h-full">
              <Image
                src={`/api/uploads/${data.fotos[selectedImageIndex]}`}
                alt={`Foto Mobil ${selectedImageIndex + 1}`}
                width={1500}
                height={1200}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: "calc(100vh - 120px)" }}
                unoptimized
              />
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {selectedImageIndex + 1} / {data.fotos.length}
            </div>

            {/* Thumbnail Navigation */}
            {data.fotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80%] overflow-x-auto scrollbar-hide">
                {data.fotos.map((foto, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === i
                        ? "border-white shadow-lg"
                        : "border-white border-opacity-50 hover:border-opacity-75"
                    }`}
                  >
                    <Image
                      src={`/api/uploads/${foto}`}
                      alt={`Thumbnail ${i + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Keyboard Hints */}
            {data.fotos.length > 1 && (
              <div className="absolute bottom-4 right-4 z-20 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-xs">
                ← → untuk navigasi • ESC untuk tutup
              </div>
            )}
          </div>

          {/* Background Overlay */}
          <div className="absolute inset-0 -z-10" onClick={closeImageModal} />
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                <p className="text-gray-600">
                  {data.merek} {data.tipe} ({data.tahun})
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Deskripsi:</h3>
                <p className="text-gray-600">
                  {data.deskripsi ||
                    "Tidak ada deskripsi tersedia untuk kendaraan ini."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Spesifikasi Singkat:
                </h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Transmisi: {data.transmisi}</li>
                  <li>• Bahan Bakar: {data.bahan_bakar}</li>
                  <li>• Kapasitas Mesin: {data.kapasitas_mesin} cc</li>
                  <li>• Kilometer: {data.kilometer}</li>
                  <li>• Warna: {data.warna}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Harga:</h3>
                <p className="text-orange-600 text-lg font-bold">
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
