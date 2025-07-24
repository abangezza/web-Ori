// src/components/editMobilForm.tsx
"use client";

import { useReducer, useState, useEffect } from "react";
import { MobilType } from "@/types/mobil";
import { useRouter } from "next/navigation";

interface EditMobilFormProps {
  data: MobilType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formReducer = (state: any, event: any) => {
  // Reset form
  if (event.type === "RESET") {
    return {};
  }

  // Initialize form with existing data
  if (event.type === "INITIALIZE") {
    return event.payload;
  }

  if (event.target.name === "fotos") {
    return {
      ...state,
      fotos: event.target.files,
    };
  }

  // Transform noRangka, noMesin, noPol to uppercase
  if (
    event.target.name === "noRangka" ||
    event.target.name === "noMesin" ||
    event.target.name === "noPol"
  ) {
    return {
      ...state,
      [event.target.name]: event.target.value.toUpperCase(),
    };
  }

  // Transform tipe to title case (first letter uppercase)
  if (event.target.name === "tipe") {
    const titleCase = event.target.value
      .split(" ")
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
    return {
      ...state,
      [event.target.name]: titleCase,
    };
  }

  return {
    ...state,
    [event.target.name]: event.target.value,
  };
};

export default function EditMobilForm({
  data,
  onSuccess,
  onCancel,
}: EditMobilFormProps) {
  const [formData, setFormData] = useReducer(formReducer, {});
  const [notif, setNotif] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const merekOptions = [
    "TOYOTA",
    "HONDA",
    "SUZUKI",
    "NISSAN",
    "MITSUBISHI",
    "DAIHATSU",
    "MAZDA",
    "HYUNDAI",
    "KIA",
    "FORD",
    "CHEVROLET",
    "ISUZU",
    "BMW",
    "MERCEDES-BENZ",
    "AUDI",
    "VOLKSWAGEN",
    "LEXUS",
    "TESLA",
    "PORSCHE",
    "FERRARI",
    "LAMBORGHINI",
    "ROLLS-ROYCE",
    "BENTLEY",
    "ASTON MARTIN",
    "JAGUAR",
    "LAND ROVER",
    "PEUGEOT",
    "RENAULT",
    "VOLVO",
    "CHERY",
    "BYD",
  ];

  const warnaOptions = [
    "Hitam",
    "Putih",
    "Abu-Abu",
    "Silver",
    "Merah",
    "Biru",
    "Kuning",
    "Hijau",
    "Coklat",
    "Orange",
    "Ungu",
    "Navy",
    "Maroon",
    "Gold",
    "Bronze",
    "Cream",
    "Champagne",
    "Biru Muda",
    "Hijau Tua",
    "Abu Tua",
  ];

  const bahanBakarOptions = [
    "Bensin",
    "Solar",
    "Electric Vehicle (EV)",
    "Hybrid",
    "Plug-in Hybrid (PHEV)",
  ];

  // Initialize form with existing data
  useEffect(() => {
    if (data) {
      console.log("Initializing form with data:", data);

      // Format pajak date to YYYY-MM-DD for date input
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        type: "INITIALIZE",
        payload: {
          merek: data.merek || "",
          tipe: data.tipe || "",
          tahun: data.tahun?.toString() || "",
          warna: data.warna || "",
          noPol: data.noPol || "",
          noRangka: data.noRangka || "",
          noMesin: data.noMesin || "",
          kapasitas_mesin: data.kapasitas_mesin?.toString() || "",
          bahan_bakar: data.bahan_bakar || "",
          transmisi: data.transmisi || "",
          kilometer: data.kilometer?.toString() || "",
          harga: data.harga?.toString() || "",
          dp: data.dp?.toString() || "",
          angsuran_4_thn: data.angsuran_4_thn?.toString() || "",
          angsuran_5_tahun: data.angsuran_5_tahun?.toString() || "",
          pajak: formatDateForInput(data.pajak) || "",
          STNK: data.STNK || "",
          BPKB: data.BPKB || "",
          Faktur: data.Faktur || "",
          deskripsi: data.deskripsi || "",
          status: data.status || "tersedia",
        },
      });
    }
  }, [data]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const event = {
        target: {
          name: "fotos",
          files: e.dataTransfer.files,
        },
      };
      setFormData(event);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData || Object.keys(formData).length === 0) {
      setNotif({ message: "Data masih kosong", type: "error" });
      setIsSubmitting(false);
      return;
    }

    // Photo validation logic untuk update
    const currentPhotos = data.fotos?.length || 0;
    const newPhotos = formData.fotos?.length || 0;

    if (newPhotos > 0) {
      // Validate new photos (max 10 new photos at once)
      if (newPhotos > 10) {
        setNotif({
          message: "Maksimal 10 foto baru yang bisa ditambahkan sekaligus",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate individual files
      for (let i = 0; i < formData.fotos.length; i++) {
        const file = formData.fotos[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setNotif({
            message: "Semua file harus berupa gambar",
            type: "error",
          });
          setIsSubmitting(false);
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setNotif({
            message: "Ukuran file maksimal 5MB per foto",
            type: "error",
          });
          setIsSubmitting(false);
          return;
        }
      }
    }

    const dataToSend = new FormData();

    // Add all form data except photos
    for (const key in formData) {
      if (key !== "fotos") {
        dataToSend.append(key, formData[key]);
      }
    }

    // Add photos if new ones are uploaded
    if (formData.fotos && formData.fotos.length > 0) {
      for (let i = 0; i < formData.fotos.length; i++) {
        const file = formData.fotos[i];
        dataToSend.append("fotos", file);
      }
      console.log(`Uploading ${formData.fotos.length} new photos`);
    }

    try {
      const res = await fetch(`/api/mobil/${data._id}`, {
        method: "PUT",
        body: dataToSend,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setNotif({ message: "Mobil berhasil diupdate", type: "success" });

        // Reset file input
        setFormData({
          ...formData,
          fotos: null,
        });

        // Close modal after success
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setNotif({
          message: result.message || "Gagal mengupdate mobil",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      setNotif({
        message: "Terjadi kesalahan saat mengupdate data",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg";
  const selectClassName =
    "w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg appearance-none bg-white";
  const labelClassName = "block text-base font-semibold text-gray-700 mb-3";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Edit Mobil</h1>
          <p className="text-xl text-gray-600">
            Update informasi mobil {data.merek} {data.tipe}
          </p>
        </div>

        {notif && (
          <div
            className={`mb-8 max-w-4xl mx-auto p-4 rounded-lg ${
              notif.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notif.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-12 md:p-16"
        >
          {/* Informasi Dasar */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                1
              </div>
              Informasi Dasar Kendaraan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <label className={labelClassName}>Merek</label>
                <div className="relative">
                  <select
                    name="merek"
                    value={formData.merek || ""}
                    onChange={setFormData}
                    className={selectClassName}
                    required
                  >
                    <option value="{formData.merek}">{formData.merek}</option>
                    {merekOptions.map((merek) => (
                      <option key={merek} value={merek}>
                        {merek}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Tipe</label>
                <input
                  name="tipe"
                  type="text"
                  placeholder="Contoh: Avanza, Civic, Swift"
                  value={formData.tipe || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Tahun</label>
                <input
                  name="tahun"
                  type="number"
                  placeholder="Tahun pembuatan"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.tahun || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Warna</label>
                <div className="relative">
                  <select
                    name="warna"
                    value={formData.warna || ""}
                    onChange={setFormData}
                    className={selectClassName}
                    required
                  >
                    <option value="">Pilih Warna Kendaraan</option>
                    {warnaOptions.map((warna) => (
                      <option key={warna} value={warna}>
                        {warna}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Bahan Bakar</label>
                <div className="relative">
                  <select
                    name="bahan_bakar"
                    value={formData.bahan_bakar || ""}
                    onChange={setFormData}
                    className={selectClassName}
                    required
                  >
                    <option value="">Pilih Bahan Bakar</option>
                    {bahanBakarOptions.map((bahan) => (
                      <option key={bahan} value={bahan}>
                        {bahan}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Transmisi</label>
                <div className="relative">
                  <select
                    name="transmisi"
                    value={formData.transmisi || ""}
                    onChange={setFormData}
                    className={selectClassName}
                    required
                  >
                    <option value="{formData.transmisi}">
                      {formData.transmisi}
                    </option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Triptonic">Triptonic</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Spesifikasi Teknis */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                2
              </div>
              Spesifikasi Teknis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <label className={labelClassName}>Kapasitas Mesin</label>
                <input
                  name="kapasitas_mesin"
                  type="number"
                  placeholder="Kapasitas mesin (cc)"
                  min="50"
                  max="10000"
                  value={formData.kapasitas_mesin || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Kilometer</label>
                <input
                  name="kilometer"
                  type="text"
                  placeholder="Contoh: 50,000 km"
                  value={formData.kilometer || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>No. Polisi</label>
                <input
                  name="noPol"
                  type="text"
                  placeholder="Contoh: B 1234 XYZ"
                  value={formData.noPol || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>No. Rangka</label>
                <input
                  name="noRangka"
                  type="text"
                  placeholder="Nomor rangka kendaraan"
                  value={formData.noRangka || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>No. Mesin</label>
                <input
                  name="noMesin"
                  type="text"
                  placeholder="Nomor mesin kendaraan"
                  value={formData.noMesin || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Masa Berlaku STNK</label>
                <input
                  type="date"
                  name="pajak"
                  value={formData.pajak || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>
            </div>
          </div>

          {/* Informasi Harga */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                3
              </div>
              Informasi Harga & Kredit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              <div>
                <label className={labelClassName}>Harga Jual</label>
                <input
                  name="harga"
                  type="number"
                  placeholder="Harga dalam rupiah"
                  min="0"
                  value={formData.harga || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Down Payment (DP)</label>
                <input
                  name="dp"
                  type="number"
                  placeholder="DP dalam rupiah"
                  min="0"
                  value={formData.dp || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Angsuran 4 Tahun</label>
                <input
                  name="angsuran_4_thn"
                  type="number"
                  placeholder="Angsuran per bulan"
                  min="0"
                  value={formData.angsuran_4_thn || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Angsuran 5 Tahun</label>
                <input
                  name="angsuran_5_tahun"
                  type="number"
                  placeholder="Angsuran per bulan"
                  min="0"
                  value={formData.angsuran_5_tahun || ""}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>
            </div>
          </div>

          {/* Dokumen */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                4
              </div>
              Kelengkapan Dokumen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {["STNK", "BPKB", "Faktur"].map((name) => (
                <div key={name}>
                  <label className={labelClassName}>{name}</label>
                  <div className="relative">
                    <select
                      name={name}
                      value={formData[name] || ""}
                      className={selectClassName}
                      onChange={setFormData}
                      required
                    >
                      <option value="">Pilih status {name}</option>
                      <option value="Ada">✓ Ada</option>
                      <option value="Tidak Ada">✗ Tidak Ada</option>
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deskripsi & Status */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                5
              </div>
              Deskripsi & Status
            </h2>
            <div className="space-y-8">
              <div>
                <label className={labelClassName}>Deskripsi Kendaraan</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi || ""}
                  onChange={setFormData}
                  rows={4}
                  className={inputClassName}
                  placeholder="Jelaskan kondisi kendaraan, fitur khusus, atau informasi penting lainnya..."
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Status Kendaraan</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="tersedia"
                      checked={formData.status === "tersedia"}
                      onChange={setFormData}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="text-lg font-medium text-gray-700">
                      Tersedia
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="terjual"
                      checked={formData.status === "terjual"}
                      onChange={setFormData}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                      required
                    />
                    <span className="text-lg font-medium text-gray-700">
                      Terjual
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Foto */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                6
              </div>
              Update Foto Kendaraan (Opsional)
            </h2>
            <div className="mb-6">
              <p className="text-lg text-gray-600 mb-2">
                <strong>Foto saat ini:</strong> {data.fotos?.length || 0} foto
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Cara kerja update foto:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Foto baru akan ditambahkan ke koleksi existing</li>
                  <li>
                    • Jika total foto melebihi 10, foto lama dari awal akan
                    dihapus otomatis dari server
                  </li>
                  <li>• Minimal 6 foto, maksimal 10 foto setelah update</li>
                  <li>
                    • Maksimal 10 foto baru yang bisa ditambahkan sekaligus
                  </li>
                  <li>
                    • File lama yang dihapus akan dibersihkan dari VPS secara
                    otomatis
                  </li>
                </ul>
              </div>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg
                className="w-20 h-20 mx-auto text-gray-400 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-2xl font-medium text-gray-700 mb-3">
                Drag & Drop foto tambahan atau klik untuk memilih
              </p>
              <p className="text-lg text-gray-500 mb-6">
                Upload foto baru untuk ditambahkan ke koleksi existing
              </p>
              <input
                type="file"
                name="fotos"
                accept="image/*"
                multiple
                className="hidden"
                id="foto-upload"
                onChange={setFormData}
              />
              <label
                htmlFor="foto-upload"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-8 rounded-xl cursor-pointer transition-colors text-lg"
              >
                Tambah Foto Baru
              </label>
              {formData.fotos && (
                <div className="mt-6 text-lg text-gray-600">
                  {formData.fotos.length} foto baru akan ditambahkan
                  <br />
                  <span className="text-sm">
                    Total setelah update:{" "}
                    {Math.min(
                      10,
                      (data.fotos?.length || 0) + formData.fotos.length
                    )}{" "}
                    foto
                    {(data.fotos?.length || 0) + formData.fotos.length > 10 && (
                      <span className="text-orange-600 block mt-1">
                        (
                        {(data.fotos?.length || 0) + formData.fotos.length - 10}{" "}
                        foto lama akan dihapus dari server)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-x-6">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center px-8 py-4 text-xl font-medium rounded-xl bg-gray-500 hover:bg-gray-600 text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center px-10 py-5 text-2xl font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white mr-4"></div>
                  Mengupdate...
                </>
              ) : (
                <>
                  <svg
                    className="w-7 h-7 mr-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update Mobil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
