// src/components/forms/BeliCashForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MobilType } from "@/types/mobil";
// Remove the import since we'll use API endpoint instead

interface BeliCashFormProps {
  mobil: MobilType;
}

interface BeliCashFormData {
  nama: string;
  nomorWhatsapp: string;
  hargaTawaran: string;
}

const BeliCashForm: React.FC<BeliCashFormProps> = ({ mobil }) => {
  const [cashFormData, setCashFormData] = useState<BeliCashFormData>({
    nama: "",
    nomorWhatsapp: "",
    hargaTawaran: "",
  });

  const [cashErrors, setCashErrors] = useState<{ [key: string]: string }>({});
  const [isSubmittingCash, setIsSubmittingCash] = useState(false);
  const [isCashFormValid, setIsCashFormValid] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Validasi nomor WhatsApp Indonesia
  const validateWhatsappNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, "");
    const patterns = [/^08\d{8,11}$/, /^628\d{8,11}$/, /^\+628\d{8,11}$/];
    return patterns.some((pattern) => pattern.test(number));
  };

  // Format input nomor WhatsApp
  const formatWhatsappNumber = (number: string): string => {
    const cleanNumber = number.replace(/\D/g, "");

    if (cleanNumber.startsWith("08")) {
      return "+62" + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith("8")) {
      return "+62" + cleanNumber;
    } else if (cleanNumber.startsWith("628")) {
      return "+" + cleanNumber;
    } else if (cleanNumber.startsWith("62")) {
      return "+" + cleanNumber;
    }

    return number;
  };

  // Handle cash form changes
  const handleCashInputChange = (field: string, value: string) => {
    let newCashErrors = { ...cashErrors };
    let updatedCashFormData = { ...cashFormData, [field]: value };

    delete newCashErrors[field];

    if (field === "nomorWhatsapp") {
      if (value && !validateWhatsappNumber(value)) {
        newCashErrors.nomorWhatsapp = "Format nomor WhatsApp tidak valid";
      } else {
        updatedCashFormData.nomorWhatsapp = formatWhatsappNumber(value);
      }
    }

    setCashFormData(updatedCashFormData);
    setCashErrors(newCashErrors);
  };

  // Validate cash form
  useEffect(() => {
    const { nama, nomorWhatsapp, hargaTawaran } = cashFormData;
    const isValid =
      nama.trim() !== "" &&
      nomorWhatsapp.trim() !== "" &&
      validateWhatsappNumber(nomorWhatsapp) &&
      hargaTawaran.trim() !== "" &&
      Object.keys(cashErrors).length === 0;

    setIsCashFormValid(isValid);
  }, [cashFormData, cashErrors]);

  // Handle cash form submission with price validation
  const handleSubmitCash = async () => {
    if (!isCashFormValid) return;

    // Check price before submitting
    const hargaTawaranValue = parseInt(
      cashFormData.hargaTawaran.replace(/\D/g, "")
    );
    const selisihHarga = mobil.harga - hargaTawaranValue;

    if (selisihHarga > 7000000) {
      setShowNotificationModal(true);
      return;
    }

    setIsSubmittingCash(true);

    try {
      // Save customer activity via API
      const activityResponse = await fetch("/api/customer-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: cashFormData.nama,
          noHp: cashFormData.nomorWhatsapp,
          mobilId: mobil._id,
          activityType: "beli_cash",
          additionalData: {
            hargaTawaran: hargaTawaranValue,
            hargaAsli: mobil.harga,
            selisihHarga: selisihHarga,
          },
        }),
      });

      if (!activityResponse.ok) {
        console.warn(
          "Failed to save customer activity, but continuing with WhatsApp..."
        );
      }

      const hargaTawaranFormatted = hargaTawaranValue.toLocaleString("id-ID");

      const message = `Hallo bang, saya ${cashFormData.nama}, ingin mengajukan Pembelian Mobil secara Cash, untuk mobil ${mobil.tipe} dengan No Polisi ${mobil.noPol} dengan tawaran Rp.${hargaTawaranFormatted}, Apakah Boleh??`;

      const whatsappUrl = `https://wa.me/628111110067?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");

      // Reset form
      setCashFormData({
        nama: "",
        nomorWhatsapp: "",
        hargaTawaran: "",
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert("Terjadi kesalahan saat mengirim pesan");
    } finally {
      setIsSubmittingCash(false);
    }
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
  };

  return (
    <>
      <div className="w-full max-w-[1110px] bg-gray-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Beli Cash</h2>
        <p className="text-gray-600 mb-6">
          Berikut adalah Form untuk Penawaran Beli Cash
        </p>

        <div className="space-y-6">
          {/* Nama */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nama</label>
            <input
              type="text"
              placeholder="Masukan Nama Anda"
              value={cashFormData.nama}
              onChange={(e) => handleCashInputChange("nama", e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {cashErrors.nama && (
              <p className="text-red-500 text-sm mt-1">{cashErrors.nama}</p>
            )}
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nomer Whatsapp
            </label>
            <input
              type="text"
              placeholder="Masukan Nomer Hp Anda"
              value={cashFormData.nomorWhatsapp}
              onChange={(e) =>
                handleCashInputChange("nomorWhatsapp", e.target.value)
              }
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {cashErrors.nomorWhatsapp && (
              <p className="text-red-500 text-sm mt-1">
                {cashErrors.nomorWhatsapp}
              </p>
            )}
          </div>

          {/* Harga Tawaran */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Harga Tawaran
            </label>
            <input
              type="text"
              placeholder="Isi Harga Tawaran Anda"
              value={cashFormData.hargaTawaran}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formatted = value
                  ? parseInt(value).toLocaleString("id-ID")
                  : "";
                handleCashInputChange("hargaTawaran", formatted);
              }}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {cashErrors.hargaTawaran && (
              <p className="text-red-500 text-sm mt-1">
                {cashErrors.hargaTawaran}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Harga mobil: Rp.{mobil.harga.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitCash}
            disabled={!isCashFormValid || isSubmittingCash}
            className={`w-full py-4 rounded-xl text-white font-medium transition-colors ${
              isCashFormValid && !isSubmittingCash
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmittingCash ? "Mengirim..." : "Ajukan Beli Cash"}
          </button>
        </div>
      </div>

      {/* Notification Modal for Low Price Offer */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">😅</div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">
                Wah Tawarannya Terlalu Rendah
              </h3>
              <p className="text-gray-600">
                Harga yang Anda tawarkan terlalu jauh dari harga mobil. Silakan
                masukkan harga yang lebih realistis.
              </p>
            </div>

            <button
              onClick={closeNotificationModal}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Oke, Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BeliCashForm;
