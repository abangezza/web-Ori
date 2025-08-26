// src/app/(admin)/dashboard/detailmobil/[id]/MobilDetailClient.tsx - COMPLETE VERSION
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
import MobilInteractionsTable from "@/components/MobilInteractionsTable"; // NEW IMPORT

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
              {isAdmin ? "ADMIN" : "KARYAWAN"}
            </div>
            <span className="text-gray-600">
              Login sebagai: <strong>{userName}</strong>
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Status:
            <span
              className={`ml-1 font-medium ${
                status === "tersedia" ? "text-green-600" : "text-blue-600"
              }`}
            >
              {status === "tersedia" ? "Tersedia" : "Terjual"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Photos Accordion */}
      <div className="mb-8">
        <MobilImageAccordion data={data} onImageClick={openImageModal} />
      </div>

      {/* Mobile Information */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 break-words">
          {mobilName}
        </h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center justify-center bg-blue-50 rounded-lg p-3 md:p-4">
            <FaCalendarAlt className="text-blue-600 mr-2 text-lg md:text-xl" />
            <div>
              <div className="text-xs text-gray-600">Tahun</div>
              <div className="font-semibold text-gray-800">{data.tahun}</div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-green-50 rounded-lg p-3 md:p-4">
            <MdOutlineAvTimer className="text-green-600 mr-2 text-lg md:text-xl" />
            <div>
              <div className="text-xs text-gray-600">KM</div>
              <div className="font-semibold text-gray-800">
                {data.kilometer?.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-orange-50 rounded-lg p-3 md:p-4">
            <FaCarSide className="text-orange-600 mr-2 text-lg md:text-xl" />
            <div>
              <div className="text-xs text-gray-600">Transmisi</div>
              <div className="font-semibold text-gray-800 capitalize">
                {data.transmisi}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-purple-50 rounded-lg p-3 md:p-4">
            <FaGasPump className="text-purple-600 mr-2 text-lg md:text-xl" />
            <div>
              <div className="text-xs text-gray-600">Bahan Bakar</div>
              <div className="font-semibold text-gray-800 capitalize">
                {data.bahan_bakar}
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600 mb-4">
          Rp.{data.harga.toLocaleString("id-ID")}
        </p>

        {/* Description Button */}
        <div className="mb-6">
          <button
            onClick={openDescriptionModal}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Deskripsi Unit
          </button>
        </div>

        {/* Vehicle Details */}
        <div className="w-full max-w-full overflow-hidden bg-white rounded-[5px] border border-gray-200 p-4 md:p-6">
          <VehicleSpecifications data={data} />
          <VehicleDocuments data={data} />
          <CreditCalculation data={data} />

          {/* Action Buttons - Role-based - FIXED */}
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

          {/* Delete Button - Only for Admin */}
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

      {/* NEW: MOBIL INTERACTIONS TABLE */}
      <div className="mb-8">
        <MobilInteractionsTable
          mobilId={data._id}
          mobilInfo={{
            merek: data.merek,
            tipe: data.tipe,
            noPol: data.noPol,
          }}
        />
      </div>

      {/* Modals */}

      {/* Enhanced Image Modal */}
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
                <h3 className="font-semibold text-gray-700 mb-2">
                  No. Polisi:
                </h3>
                <p className="text-gray-600 font-mono text-lg">{data.noPol}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Harga:</h3>
                <p className="text-red-600 font-bold text-xl">
                  Rp.{data.harga.toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Deskripsi:</h3>
                <p className="text-gray-600 break-words whitespace-pre-wrap">
                  {data.deskripsi ||
                    "Tidak ada deskripsi tersedia untuk kendaraan ini."}
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
                Konfirmasi Hapus Mobil
              </h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Anda akan menghapus:</p>
                <p className="font-semibold text-gray-800 text-lg break-words">
                  {mobilName}
                </p>
                <p className="text-sm text-gray-600 mt-1 break-words">
                  No. Polisi: {data.noPol}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-red-700 text-sm font-medium">
                  Peringatan: Aksi ini tidak dapat dibatalkan!
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Semua data mobil dan foto akan terhapus permanen.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteConfirmModal}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium ${
                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus Mobil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
