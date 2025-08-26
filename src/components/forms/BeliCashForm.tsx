// src/components/forms/BeliCashForm.tsx - FIXED VERSION
"use client";

import React, { useState, useEffect } from "react";
import { MobilType } from "@/types/mobil";

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
  const [showValidationMessage, setShowValidationMessage] = useState("");

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

  // ✅ NEW: Calculate 9% validation
  const calculateOfferValidation = (hargaTawaran: number) => {
    const maxDiscountPercentage = 9; // 9%
    const maxDiscount = mobil.harga * (maxDiscountPercentage / 100);
    const minAcceptableOffer = mobil.harga - maxDiscount;
    const discount = mobil.harga - hargaTawaran;
    const discountPercentage = (discount / mobil.harga) * 100;

    return {
      isValid: hargaTawaran >= minAcceptableOffer,
      minAcceptable: Math.round(minAcceptableOffer),
      discount: Math.round(discount),
      discountPercentage: Math.round(discountPercentage * 100) / 100,
      errorMessage:
        hargaTawaran < minAcceptableOffer
          ? `❌ Tawaran terlalu rendah! Minimum: Rp ${minAcceptableOffer.toLocaleString(
              "id-ID"
            )} (maksimal diskon ${maxDiscountPercentage}%)`
          : `✅ Tawaran valid! Diskon: ${discountPercentage.toFixed(1)}%`,
    };
  };

  // Handle cash form changes with real-time validation
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

    // ✅ NEW: Real-time price validation
    if (field === "hargaTawaran" && value) {
      const hargaTawaranValue = parseInt(value.replace(/\D/g, ""));
      if (hargaTawaranValue > 0) {
        const validation = calculateOfferValidation(hargaTawaranValue);
        setShowValidationMessage(validation.errorMessage || "");

        if (!validation.isValid) {
          newCashErrors.hargaTawaran = validation.errorMessage;
        }
      } else {
        setShowValidationMessage("");
      }
    }

    setCashFormData(updatedCashFormData);
    setCashErrors(newCashErrors);
  };

  // Validate cash form
  useEffect(() => {
    const { nama, nomorWhatsapp, hargaTawaran } = cashFormData;
    const hargaTawaranValue = parseInt(hargaTawaran.replace(/\D/g, ""));

    let isValid = false;

    if (
      nama.trim() !== "" &&
      nomorWhatsapp.trim() !== "" &&
      validateWhatsappNumber(nomorWhatsapp) &&
      hargaTawaran.trim() !== "" &&
      Object.keys(cashErrors).length === 0
    ) {
      // Additional validation for price
      if (hargaTawaranValue > 0) {
        const validation = calculateOfferValidation(hargaTawaranValue);
        isValid = validation.isValid;
      }
    }

    setIsCashFormValid(isValid);
  }, [cashFormData, cashErrors]);

  // ✅ FIXED: Handle cash form submission with enhanced API
  const handleSubmitCash = async () => {
    if (!isCashFormValid) return;

    const hargaTawaranValue = parseInt(
      cashFormData.hargaTawaran.replace(/\D/g, "")
    );

    setIsSubmittingCash(true);
    setShowValidationMessage("Memproses tawaran...");

    try {
      console.log("Submitting cash offer:", {
        nama: cashFormData.nama,
        noHp: cashFormData.nomorWhatsapp,
        mobilId: mobil._id,
        hargaTawaran: hargaTawaranValue,
        hargaAsli: mobil.harga,
      });

      // ✅ FIXED: Save customer activity via enhanced API
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
            selisihHarga: mobil.harga - hargaTawaranValue,
            persentaseDiskon:
              ((mobil.harga - hargaTawaranValue) / mobil.harga) * 100,
          },
        }),
      });

      const activityResult = await activityResponse.json();
      console.log("Activity save result:", activityResult);

      if (!activityResponse.ok || !activityResult.success) {
        if (activityResult.validation && !activityResult.validation.isValid) {
          // ✅ NEW: Handle 9% validation error from API
          setShowValidationMessage(
            `❌ ${activityResult.error || "Tawaran ditolak sistem"}`
          );
          setCashErrors({ hargaTawaran: activityResult.error });
          return;
        } else {
          console.warn("Failed to save customer activity:", activityResult);
          setShowValidationMessage(
            "⚠️ Gagal menyimpan data, tapi lanjut ke WhatsApp..."
          );
        }
      } else {
        setShowValidationMessage("✅ Tawaran berhasil disimpan!");
      }

      // Send to WhatsApp
      const hargaTawaranFormatted = hargaTawaranValue.toLocaleString("id-ID");
      const validation = calculateOfferValidation(hargaTawaranValue);

      const message = `Hallo bang, saya ${cashFormData.nama}, ingin mengajukan Pembelian Mobil secara Cash untuk mobil ${mobil.tipe} dengan No Polisi ${mobil.noPol} dengan tawaran Rp.${hargaTawaranFormatted} (diskon ${validation.discountPercentage}%). Apakah boleh?`;

      const whatsappUrl = `https://wa.me/628111110067?text=${encodeURIComponent(
        message
      )}`;

      // Delay to show success message
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 1500);

      // Reset form after delay
      setTimeout(() => {
        setCashFormData({
          nama: "",
          nomorWhatsapp: "",
          hargaTawaran: "",
        });
        setShowValidationMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error in cash offer submission:", error);
      setShowValidationMessage("❌ Terjadi kesalahan saat mengirim tawaran");
    } finally {
      setIsSubmittingCash(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-50 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
      <div className="mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
          Beli Cash
        </h2>
        <p className="text-sm lg:text-base text-gray-600">
          Form penawaran pembelian cash dengan validasi otomatis (maksimal
          diskon 9%)
        </p>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {/* Nama */}
        <div>
          <label className="block text-gray-700 font-medium mb-2 text-sm lg:text-base">
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="Masukan nama lengkap Anda"
            value={cashFormData.nama}
            onChange={(e) => handleCashInputChange("nama", e.target.value)}
            className="w-full p-3 lg:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
          />
          {cashErrors.nama && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">
              {cashErrors.nama}
            </p>
          )}
        </div>

        {/* Nomor WhatsApp */}
        <div>
          <label className="block text-gray-700 font-medium mb-2 text-sm lg:text-base">
            Nomor WhatsApp
          </label>
          <input
            type="text"
            placeholder="Contoh: 08123456789"
            value={cashFormData.nomorWhatsapp}
            onChange={(e) =>
              handleCashInputChange("nomorWhatsapp", e.target.value)
            }
            className="w-full p-3 lg:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
          />
          {cashErrors.nomorWhatsapp && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">
              {cashErrors.nomorWhatsapp}
            </p>
          )}
        </div>

        {/* Harga Tawaran with Real-time Validation */}
        <div>
          <label className="block text-gray-700 font-medium mb-2 text-sm lg:text-base">
            Harga Tawaran
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Masukan harga tawaran Anda"
              value={cashFormData.hargaTawaran}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formatted = value
                  ? parseInt(value).toLocaleString("id-ID")
                  : "";
                handleCashInputChange("hargaTawaran", formatted);
              }}
              className="w-full p-3 lg:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
            />

            {/* Price Info Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs lg:text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <span className="text-blue-600 font-medium">Harga Mobil:</span>
                <br />
                <span className="font-semibold">
                  Rp {mobil.harga.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <span className="text-green-600 font-medium">
                  Minimum Tawaran (9%):
                </span>
                <br />
                <span className="font-semibold">
                  Rp {Math.round(mobil.harga * 0.91).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Real-time Validation Message */}
            {showValidationMessage && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  showValidationMessage.includes("✅")
                    ? "bg-green-100 text-green-800"
                    : showValidationMessage.includes("❌")
                    ? "bg-red-100 text-red-800"
                    : showValidationMessage.includes("⚠️")
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {showValidationMessage}
              </div>
            )}
          </div>

          {cashErrors.hargaTawaran && (
            <p className="text-red-500 text-xs lg:text-sm mt-1">
              {cashErrors.hargaTawaran}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitCash}
          disabled={!isCashFormValid || isSubmittingCash}
          className={`w-full py-3 lg:py-4 rounded-xl text-white font-medium transition-all duration-300 text-sm lg:text-base ${
            isCashFormValid && !isSubmittingCash
              ? "bg-green-500 hover:bg-green-600 transform hover:scale-105 shadow-lg"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmittingCash ? "Memproses Tawaran..." : "Ajukan Tawaran Cash"}
        </button>

        {/* Info Disclaimer */}
        <div className="bg-gray-100 p-3 rounded-lg text-xs lg:text-sm text-gray-600">
          <p className="font-medium mb-1">ℹ️ Informasi Penting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Tawaran maksimal diskon 9% dari harga mobil</li>
            <li>Tawaran melebihi batas akan otomatis ditolak sistem</li>
            <li>
              Setelah submit, Anda akan diarahkan ke WhatsApp untuk konfirmasi
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BeliCashForm;
