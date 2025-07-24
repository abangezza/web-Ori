// src/app/(admin)/dashboard/detailmobil/[id]/MobilDetailClient.tsx - Updated Version
"use client";

import { MobilType } from "@/types/mobil";
import { FaGasPump, FaCalendarAlt, FaCarSide } from "react-icons/fa";
import { MdOutlineAvTimer } from "react-icons/md";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UpdateMobil from "@/components/updateMobil";
import MobilImageAccordion from "@/components/MobilImageAccordion";
import MobilImageModal from "@/components/MobilImageModal";
import VehicleSpecifications from "@/components/VehicleSpecifications";
import VehicleDocuments from "@/components/VehicleDocuments";
import CreditCalculation from "@/components/CreditCalculation";

interface MobilDetailClientWrapperProps {
  data: MobilType;
  userRole: "admin" | "karyawan";
  userName: string;
}

export default function MobilDetailClientWrapper({
  data,
  userRole,
  userName,
}: MobilDetailClientWrapperProps) {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [status, setStatus] = useState(data.status || "tersedia");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Check if user is admin
  const isAdmin = userRole === "admin";

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mobil/${data._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        router.refresh();
      } else {
        console.error("Failed to update status");
        alert("Gagal mengupdate status mobil");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan saat mengupdate status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      alert("Anda tidak memiliki akses untuk menghapus mobil");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/mobil/${data._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Mobil berhasil dihapus");
        router.push("/dashboard");
        router.refresh();
      } else {
        console.error("Failed to delete mobil");
        alert("Gagal menghapus mobil. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error deleting mobil:", error);
      alert("Terjadi kesalahan saat menghapus mobil.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmModal(false);
    }
  };

  const handleTersedia = () => {
    updateStatus("tersedia");
  };

  const handleTerjual = () => {
    updateStatus("terjual");
  };

  const openDescriptionModal = () => {
    setShowDescriptionModal(true);
  };

  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
  };

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const openDeleteConfirmModal = () => {
    if (!isAdmin) {
      alert("Fitur hapus mobil hanya tersedia untuk Admin");
      return;
    }
    setShowDeleteConfirmModal(true);
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    router.refresh();
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

  const mobilName = `${data.merek} ${data.tipe} ${data.tahun}`;

  return (
    <div className="max-w-8xl mx-auto">
      {/* User Role Info */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              {isAdmin ? "👑 Admin" : "👤 Karyawan"}
            </div>
            <span className="text-gray-600">
              Logged in as: <span className="font-medium">{userName}</span>
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {isAdmin ? "Full Access" : "Limited Access (No Delete)"}
          </div>
        </div>
      </div>

      {/* Photo Accordion/Swiper - Using the updated component */}
      <MobilImageAccordion
        fotos={data.fotos}
        mobilName={mobilName}
        onImageClick={openImageModal}
      />

      {/* Content with padding - Centered */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Judul dan Harga */}
        <h1 className="text-2xl font-bold mb-2">{mobilName}</h1>
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

        {/* Detail Kendaraan - New Design with Mobile Optimization */}
        <div className="w-full max-w-full overflow-hidden bg-white rounded-[5px] border border-gray-200 p-4 md:p-6">
          {/* Using the new components */}
          <VehicleSpecifications data={data} />
          <VehicleDocuments data={data} />
          <CreditCalculation data={data} />

          {/* Action Buttons - Role-based - Mobile Optimized */}
          <div className="flex flex-col md:flex-row flex-wrap gap-4 mt-8">
            <button
              onClick={handleTerjual}
              disabled={isLoading}
              className={`w-full md:w-80 md:min-w-72 py-3.5 rounded-2xl text-center text-white text-base cursor-pointer font-medium font-['Outfit'] transition-colors ${
                status === "terjual"
                  ? "bg-lime-600 ring-2 ring-lime-300"
                  : "bg-lime-500 hover:bg-lime-600"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading && status !== "terjual"
                ? "Loading..."
                : "Mobil Terjual"}
            </button>

            <button
              onClick={openEditModal}
              className="w-full md:w-80 md:min-w-72 py-3.5 bg-orange-500 rounded-2xl text-center text-white text-base cursor-pointer font-medium font-['Outfit'] hover:bg-orange-600 transition-colors"
            >
              Edit Data Mobil
            </button>

            <button
              onClick={handleTersedia}
              disabled={isLoading}
              className={`w-full md:w-80 md:min-w-72 py-3.5 rounded-2xl text-center text-white text-base cursor-pointer font-medium font-['Outfit'] transition-colors ${
                status === "tersedia"
                  ? "bg-blue-600 ring-2 ring-blue-300"
                  : "bg-blue-500 hover:bg-blue-600"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading && status !== "tersedia"
                ? "Loading..."
                : "Mobil Tersedia"}
            </button>
          </div>

          {/* Delete Button - Only show for Admin - Mobile Optimized */}
          {isAdmin ? (
            <div className="flex justify-center mt-4">
              <button
                onClick={openDeleteConfirmModal}
                disabled={isDeleting}
                className={`w-full md:w-80 md:min-w-72 py-3.5 bg-red-600 rounded-2xl text-center text-white text-base font-medium cursor-pointer font-['Outfit'] hover:bg-red-700 transition-colors ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? "Menghapus..." : "Hapus Mobil"}
              </button>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">
                    Akses Terbatas - Karyawan
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Fitur hapus mobil hanya tersedia untuk Admin. Hubungi admin
                    jika perlu menghapus data mobil.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal - Using the component */}
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

      {/* Description Modal */}
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Data Mobil
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <UpdateMobil
              data={data}
              onSuccess={handleUpdateSuccess}
              onCancel={closeEditModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Only for Admin */}
      {showDeleteConfirmModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-4">
                ⚠️ Konfirmasi Hapus Mobil
              </h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Anda akan menghapus:</p>
                <p className="font-semibold text-gray-800 text-lg break-words">
                  {mobilName}
                </p>
                <p className="text-sm text-gray-600 mt-1 break-words">
                  No. Pol: {data.noPol}
                </p>
              </div>

              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium text-sm">
                  🚨 Peringatan: Tindakan ini tidak dapat dibatalkan!
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Data mobil akan dihapus permanen dari database.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteConfirmModal}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Menghapus...
                    </>
                  ) : (
                    <>🗑️ Ya, Hapus</>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-blue-800 text-xs break-words">
                    Logged in as: {userName} (Admin)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
