// src/components/forms/SimulasiKreditForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MobilType } from "@/types/mobil";
// Remove the import since we'll use API endpoint instead

interface SimulasiKreditFormProps {
  mobil: MobilType;
}

interface FormData {
  nama: string;
  nomorWhatsapp: string;
  dp: string;
  tenorCicilan: string;
  angsuran: string;
}

const SimulasiKreditForm: React.FC<SimulasiKreditFormProps> = ({ mobil }) => {
  const [formData, setFormData] = useState<FormData>({
    nama: "",
    nomorWhatsapp: "",
    dp: "",
    tenorCicilan: "",
    angsuran: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Calculate angsuran based on DP and tenor
  const calculateAngsuran = (dpInput: number, tenor: string): number => {
    const dpDatabase = mobil.dp;
    const selisihDp = dpInput - dpDatabase;

    if (tenor === "4") {
      const pengurangan = selisihDp / 48;
      return mobil.angsuran_4_thn - pengurangan;
    } else if (tenor === "5") {
      const pengurangan = selisihDp / 60;
      return mobil.angsuran_5_tahun - pengurangan;
    }

    return 0;
  };

  // Handle form changes
  const handleInputChange = (field: string, value: string) => {
    const newErrors = { ...errors };
    const updatedFormData = { ...formData, [field]: value };

    delete newErrors[field];

    if (field === "nomorWhatsapp") {
      if (value && !validateWhatsappNumber(value)) {
        newErrors.nomorWhatsapp = "Format nomor WhatsApp tidak valid";
      } else {
        updatedFormData.nomorWhatsapp = formatWhatsappNumber(value);
      }
    }

    if (field === "dp") {
      const dpValue = parseInt(value.replace(/\D/g, ""));
      if (value && dpValue < mobil.dp) {
        newErrors.dp = `DP Minimal Mobil Ini Adalah Rp.${mobil.dp.toLocaleString(
          "id-ID"
        )}`;
      } else if (value && dpValue > mobil.dp && dpValue < mobil.dp + 1000000) {
        newErrors.dp = "Penambahan DP Minimal 1 juta";
      } else if (value && dpValue >= mobil.dp && updatedFormData.tenorCicilan) {
        const angsuran = calculateAngsuran(
          dpValue,
          updatedFormData.tenorCicilan
        );
        updatedFormData.angsuran = Math.round(angsuran).toString();
      }
    }

    if (field === "tenorCicilan" && updatedFormData.dp) {
      const dpValue = parseInt(updatedFormData.dp.replace(/\D/g, ""));
      if (dpValue >= mobil.dp && dpValue >= mobil.dp + 1000000) {
        const angsuran = calculateAngsuran(dpValue, value);
        updatedFormData.angsuran = Math.round(angsuran).toString();
      }
    }

    setFormData(updatedFormData);
    setErrors(newErrors);
  };

  // Validate form
  useEffect(() => {
    const { nama, nomorWhatsapp, dp, tenorCicilan, angsuran } = formData;
    const isValid =
      nama.trim() !== "" &&
      nomorWhatsapp.trim() !== "" &&
      validateWhatsappNumber(nomorWhatsapp) &&
      dp.trim() !== "" &&
      tenorCicilan.trim() !== "" &&
      angsuran.trim() !== "" &&
      Object.keys(errors).length === 0;

    setIsFormValid(isValid);
  }, [formData, errors]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      console.log("Submitting simulasi kredit for:", formData.nama); // Debug log

      // Save customer activity via API
      const activityResponse = await fetch("/api/customer-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formData.nama,
          noHp: formData.nomorWhatsapp,
          mobilId: mobil._id,
          activityType: "simulasi_kredit",
          additionalData: {
            dp: formData.dp,
            tenorCicilan: formData.tenorCicilan,
            angsuran: formData.angsuran,
          },
        }),
      });

      const activityResult = await activityResponse.json();
      console.log("Activity save result:", activityResult); // Debug log

      if (!activityResponse.ok) {
        console.warn("Failed to save customer activity:", activityResult);
      }

      const dpFormatted = parseInt(
        formData.dp.replace(/\D/g, "")
      ).toLocaleString("id-ID");
      const angsuranFormatted = parseInt(formData.angsuran).toLocaleString(
        "id-ID"
      );

      const message = `Hallo bang, saya ${formData.nama}, ingin mengajukan angsuran untuk mobil ${mobil.tipe} dengan No Polisi ${mobil.noPol} dengan DP Rp.${dpFormatted}, dan Angsuran Rp.${angsuranFormatted}`;

      const whatsappUrl = `https://wa.me/628111110067?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");

      // Reset form
      setFormData({
        nama: "",
        nomorWhatsapp: "",
        dp: "",
        tenorCicilan: "",
        angsuran: "",
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert("Terjadi kesalahan saat mengirim pesan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1110px] bg-gray-50 rounded-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulasi Kredit</h2>
      <p className="text-gray-600 mb-6">
        Berikut adalah Form untuk pengajuan Kredit
      </p>

      <div className="space-y-6">
        {/* Nama */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nama</label>
          <input
            type="text"
            placeholder="Masukan Nama Anda"
            value={formData.nama}
            onChange={(e) => handleInputChange("nama", e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.nama && (
            <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
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
            value={formData.nomorWhatsapp}
            onChange={(e) => handleInputChange("nomorWhatsapp", e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.nomorWhatsapp && (
            <p className="text-red-500 text-sm mt-1">{errors.nomorWhatsapp}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Down Payment */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Down payment (Dp)
            </label>
            <input
              type="text"
              placeholder={`*Dp Minimal ${(mobil.dp || 0).toLocaleString(
                "id-ID"
              )} Rupiah`}
              value={formData.dp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formatted = value
                  ? parseInt(value).toLocaleString("id-ID")
                  : "";
                handleInputChange("dp", formatted);
              }}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.dp && (
              <p className="text-red-500 text-sm mt-1">{errors.dp}</p>
            )}
          </div>

          {/* Tenor Cicilan */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Tenor Cicilan (Tahun)
            </label>
            <select
              value={formData.tenorCicilan}
              onChange={(e) =>
                handleInputChange("tenorCicilan", e.target.value)
              }
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tentukan Lama Waktu</option>
              <option value="4">4 Tahun</option>
              <option value="5">5 Tahun</option>
            </select>
          </div>
        </div>

        {/* Request Angsuran */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Request Angsuran
          </label>
          <input
            type="text"
            placeholder="*Masukan Angsuran yang anda inginkan"
            value={
              formData.angsuran
                ? `Rp.${parseInt(formData.angsuran).toLocaleString("id-ID")}`
                : ""
            }
            readOnly
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 rounded-xl text-white font-medium transition-colors ${
            isFormValid && !isSubmitting
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Mengirim..." : "Ajukan Angsuran"}
        </button>
      </div>
    </div>
  );
};

export default SimulasiKreditForm;
