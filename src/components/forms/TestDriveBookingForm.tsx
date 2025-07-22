// src/components/forms/TestDriveBookingForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MobilType } from "@/types/mobil";
// Remove the import since we'll use API endpoint instead

interface TestDriveBookingFormProps {
  mobil: MobilType;
}

interface TestDriveFormData {
  nama: string;
  nomorWhatsapp: string;
  tanggalTest: string;
  waktu: string;
}

const TestDriveBookingForm: React.FC<TestDriveBookingFormProps> = ({
  mobil,
}) => {
  const [testDriveFormData, setTestDriveFormData] = useState<TestDriveFormData>(
    {
      nama: "",
      nomorWhatsapp: "",
      tanggalTest: "",
      waktu: "",
    }
  );

  const [testDriveErrors, setTestDriveErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmittingTestDrive, setIsSubmittingTestDrive] = useState(false);
  const [isTestDriveFormValid, setIsTestDriveFormValid] = useState(false);

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

  // Handle test drive form changes
  const handleTestDriveInputChange = (field: string, value: string) => {
    let newTestDriveErrors = { ...testDriveErrors };
    let updatedTestDriveFormData = { ...testDriveFormData, [field]: value };

    delete newTestDriveErrors[field];

    if (field === "nomorWhatsapp") {
      if (value && !validateWhatsappNumber(value)) {
        newTestDriveErrors.nomorWhatsapp = "Format nomor WhatsApp tidak valid";
      } else {
        updatedTestDriveFormData.nomorWhatsapp = formatWhatsappNumber(value);
      }
    }

    if (field === "tanggalTest") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (value && selectedDate < today) {
        newTestDriveErrors.tanggalTest =
          "Tanggal test drive tidak boleh di masa lalu";
      }
    }

    setTestDriveFormData(updatedTestDriveFormData);
    setTestDriveErrors(newTestDriveErrors);
  };

  // Validate test drive form
  useEffect(() => {
    const { nama, nomorWhatsapp, tanggalTest, waktu } = testDriveFormData;
    const isValid =
      nama.trim() !== "" &&
      nomorWhatsapp.trim() !== "" &&
      validateWhatsappNumber(nomorWhatsapp) &&
      tanggalTest.trim() !== "" &&
      waktu.trim() !== "" &&
      Object.keys(testDriveErrors).length === 0;

    setIsTestDriveFormValid(isValid);
  }, [testDriveFormData, testDriveErrors]);

  // Handle test drive form submission
  const handleSubmitTestDrive = async () => {
    if (!isTestDriveFormValid) return;

    setIsSubmittingTestDrive(true);

    try {
      // Simpan ke database
      const response = await fetch("/api/test-drive-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namaCustomer: testDriveFormData.nama,
          noHp: testDriveFormData.nomorWhatsapp,
          mobilId: mobil._id,
          tanggalTest: testDriveFormData.tanggalTest,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan booking");
      }

      // Save customer activity via API
      const activityResponse = await fetch("/api/customer-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: testDriveFormData.nama,
          noHp: testDriveFormData.nomorWhatsapp,
          mobilId: mobil._id,
          activityType: "booking_test_drive",
          additionalData: {
            tanggalTest: testDriveFormData.tanggalTest,
            waktu: testDriveFormData.waktu,
          },
        }),
      });

      if (!activityResponse.ok) {
        console.warn("Failed to save customer activity, but continuing...");
      }

      // Format tanggal untuk WhatsApp
      const tanggalFormatted = new Date(
        testDriveFormData.tanggalTest
      ).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Kirim pesan WhatsApp
      const message = `Hallo bang, saya ${testDriveFormData.nama}, Telah Booking Test Drive, untuk mobil ${mobil.tipe} dengan No Polisi ${mobil.noPol} di hari dan tanggal ${tanggalFormatted}, pada ${testDriveFormData.waktu} hari.`;

      const whatsappUrl = `https://wa.me/628111110067?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");

      // Reset form setelah berhasil
      setTestDriveFormData({
        nama: "",
        nomorWhatsapp: "",
        tanggalTest: "",
        waktu: "",
      });

      alert("Booking test drive berhasil disimpan!");
    } catch (error) {
      console.error("Error submitting test drive booking:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat booking test drive"
      );
    } finally {
      setIsSubmittingTestDrive(false);
    }
  };

  return (
    <div className="w-full max-w-[1110px] bg-gray-50 rounded-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Booking Test Drive
      </h2>
      <p className="text-gray-600 mb-6">
        Berikut adalah Form untuk Booking Test Drive
      </p>

      <div className="space-y-6">
        {/* Nama */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nama</label>
          <input
            type="text"
            placeholder="Masukan Nama Anda"
            value={testDriveFormData.nama}
            onChange={(e) => handleTestDriveInputChange("nama", e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {testDriveErrors.nama && (
            <p className="text-red-500 text-sm mt-1">{testDriveErrors.nama}</p>
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
            value={testDriveFormData.nomorWhatsapp}
            onChange={(e) =>
              handleTestDriveInputChange("nomorWhatsapp", e.target.value)
            }
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {testDriveErrors.nomorWhatsapp && (
            <p className="text-red-500 text-sm mt-1">
              {testDriveErrors.nomorWhatsapp}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Waktu */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Waktu
            </label>
            <select
              value={testDriveFormData.waktu}
              onChange={(e) =>
                handleTestDriveInputChange("waktu", e.target.value)
              }
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Waktu Test Drive</option>
              <option value="pagi">Pagi</option>
              <option value="siang">Siang</option>
              <option value="sore">Sore</option>
            </select>
            {testDriveErrors.waktu && (
              <p className="text-red-500 text-sm mt-1">
                {testDriveErrors.waktu}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={testDriveFormData.tanggalTest}
              onChange={(e) =>
                handleTestDriveInputChange("tanggalTest", e.target.value)
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {testDriveErrors.tanggalTest && (
              <p className="text-red-500 text-sm mt-1">
                {testDriveErrors.tanggalTest}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Pilih tanggal untuk test drive (minimal hari ini)
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitTestDrive}
          disabled={!isTestDriveFormValid || isSubmittingTestDrive}
          className={`w-full py-4 rounded-xl text-white font-medium transition-colors ${
            isTestDriveFormValid && !isSubmittingTestDrive
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmittingTestDrive ? "Menyimpan..." : "Ajukan Test Drive"}
        </button>
      </div>
    </div>
  );
};

export default TestDriveBookingForm;
