"use client";

import { useReducer, useState } from "react";
import Notification from "@/components/notification";
import { useRouter } from "next/navigation";

const formReducer = (state: any, event: any) => {
  // Reset form
  if (event.type === "RESET") {
    return {};
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

interface TambahMobilPageProps {
  onSuccess?: () => void;
}

export default function TambahMobilPage({ onSuccess }: TambahMobilPageProps) {
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
    "Toyota 2",
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

    // Clear any previous notifications
    setNotif(null);

    // Validate form data
    if (!formData || Object.keys(formData).length === 0) {
      setNotif({ message: "Data masih kosong", type: "error" });
      setIsSubmitting(false);
      return;
    }

    // Validate photos - FIXED: Check both existence and count
    if (!formData.fotos || formData.fotos.length === 0) {
      setNotif({ message: "Wajib upload foto kendaraan", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (formData.fotos.length < 6 || formData.fotos.length > 10) {
      setNotif({
        message: "Wajib upload minimal 6 foto dan maksimal 10 foto",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate file types and sizes
    for (let i = 0; i < formData.fotos.length; i++) {
      const file = formData.fotos[i];

      // Check file type
      if (!file.type.startsWith("image/")) {
        setNotif({ message: "Semua file harus berupa gambar", type: "error" });
        setIsSubmitting(false);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotif({
          message: "Ukuran file maksimal 5MB per foto",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }
    }

    const dataToSend = new FormData();

    // Add all form data except photos
    for (const key in formData) {
      if (key !== "fotos") {
        dataToSend.append(key, formData[key]);
      }
    }

    // Add photos
    for (let i = 0; i < formData.fotos.length; i++) {
      const file = formData.fotos[i];
      const ext = file.name.split(".").pop();
      const randomName = `${crypto.randomUUID()}.${ext}`;
      dataToSend.append("fotos", file, randomName);
    }

    try {
      const res = await fetch("/api/mobil", {
        method: "POST",
        body: dataToSend,
      });

      const result = await res.json();
      if (res.ok) {
        setNotif({ message: "Mobil berhasil ditambahkan", type: "success" });

        // Reset form
        setFormData({ type: "RESET" });

        // Close modal and reset form after success
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setNotif({
          message: result.message || "Gagal menambahkan mobil",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      setNotif({
        message: "Terjadi kesalahan saat mengirim data",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIXED: Custom validation function
  const validateForm = () => {
    const requiredFields = [
      "merek",
      "tipe",
      "tahun",
      "warna",
      "bahan_bakar",
      "transmisi",
      "kapasitas_mesin",
      "kilometer",
      "noPol",
      "noRangka",
      "noMesin",
      "pajak",
      "harga",
      "dp",
      "angsuran_4_thn",
      "angsuran_5_tahun",
      "STNK",
      "BPKB",
      "Faktur",
      "deskripsi",
      "status",
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        return false;
      }
    }

    // Check photos
    if (
      !formData.fotos ||
      formData.fotos.length < 6 ||
      formData.fotos.length > 10
    ) {
      return false;
    }

    return true;
  };

  const inputClassName =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg";
  const selectClassName =
    "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg appearance-none bg-white";
  const labelClassName = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tambah Mobil Baru
          </h1>
          <p className="text-xl text-gray-600">
            Lengkapi informasi mobil dengan detail yang akurat
          </p>
        </div>

        {notif && (
          <div className="mb-8 max-w-2xl mx-auto">
            <Notification message={notif.message} type={notif.type} />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          noValidate
        >
          {/* Informasi Dasar */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                1
              </div>
              Informasi Dasar Kendaraan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClassName}>Merek *</label>
                <div className="relative">
                  <select
                    name="merek"
                    onChange={setFormData}
                    className={selectClassName}
                    required
                  >
                    <option value="">Pilih Merek Kendaraan</option>
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
                <label className={labelClassName}>Tipe *</label>
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
                <label className={labelClassName}>Tahun *</label>
                <input
                  name="tahun"
                  type="number"
                  placeholder="Tahun pembuatan"
                  min="1900"
                  max={new Date().getFullYear()}
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Warna *</label>
                <div className="relative">
                  <select
                    name="warna"
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
                <label className={labelClassName}>Bahan Bakar *</label>
                <div className="relative">
                  <select
                    name="bahan_bakar"
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
                <label className={labelClassName}>Transmisi *</label>
                <div className="relative">
                  <select
                    name="transmisi"
                    onChange={setFormData}
                    className={selectClassName}
                    required
                  >
                    <option value="">Pilih Transmisi</option>
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
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                2
              </div>
              Spesifikasi Teknis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClassName}>Kapasitas Mesin *</label>
                <input
                  name="kapasitas_mesin"
                  type="number"
                  placeholder="Kapasitas mesin (cc)"
                  min="50"
                  max="10000"
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Kilometer *</label>
                <input
                  name="kilometer"
                  type="text"
                  placeholder="Contoh: 50,000 km"
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>No. Polisi *</label>
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
                <label className={labelClassName}>No. Rangka *</label>
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
                <label className={labelClassName}>No. Mesin *</label>
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
                <label className={labelClassName}>Masa Berlaku STNK *</label>
                <input
                  type="date"
                  name="pajak"
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>
            </div>
          </div>

          {/* Informasi Harga */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                3
              </div>
              Informasi Harga & Kredit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelClassName}>Harga Jual *</label>
                <input
                  name="harga"
                  type="number"
                  placeholder="Harga dalam rupiah"
                  min="0"
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Down Payment (DP) *</label>
                <input
                  name="dp"
                  type="number"
                  placeholder="DP dalam rupiah"
                  min="0"
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Angsuran 4 Tahun *</label>
                <input
                  name="angsuran_4_thn"
                  type="number"
                  placeholder="Angsuran per bulan"
                  min="0"
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Angsuran 5 Tahun *</label>
                <input
                  name="angsuran_5_tahun"
                  type="number"
                  placeholder="Angsuran per bulan"
                  min="0"
                  onChange={setFormData}
                  className={inputClassName}
                  required
                />
              </div>
            </div>
          </div>

          {/* Dokumen */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                4
              </div>
              Kelengkapan Dokumen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["STNK", "BPKB", "Faktur"].map((name) => (
                <div key={name}>
                  <label className={labelClassName}>{name} *</label>
                  <div className="relative">
                    <select
                      name={name}
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
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                5
              </div>
              Deskripsi & Status
            </h2>
            <div className="space-y-6">
              <div>
                <label className={labelClassName}>Deskripsi Kendaraan *</label>
                <textarea
                  name="deskripsi"
                  onChange={setFormData}
                  rows={4}
                  className={inputClassName}
                  placeholder="Jelaskan kondisi kendaraan, fitur khusus, atau informasi penting lainnya..."
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Status Kendaraan *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="tersedia"
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

          {/* Upload Foto - FIXED: Remove required from hidden input */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                6
              </div>
              Upload Foto Kendaraan *
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="text-red-500">*</span> Wajib upload minimal 6
                foto dan maksimal 10 foto (JPG, PNG, WebP, maksimal 5MB per
                foto)
              </p>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
              <p className="text-xl font-medium text-gray-700 mb-2">
                Drag & Drop foto atau klik untuk memilih
              </p>
              <p className="text-gray-500 mb-4">
                Minimal 6 foto, maksimal 10 foto (JPG, PNG, WebP)
              </p>
              {/* FIXED: Remove required attribute and add custom validation */}
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
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg cursor-pointer transition-colors"
              >
                Pilih Foto
              </label>
              {formData.fotos && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {formData.fotos.length} foto dipilih
                  </div>
                  {formData.fotos.length < 6 && (
                    <div className="text-sm text-red-500">
                      Minimal 6 foto diperlukan
                    </div>
                  )}
                  {formData.fotos.length > 10 && (
                    <div className="text-sm text-red-500">
                      Maksimal 10 foto diperbolehkan
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center px-8 py-4 text-xl font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6 mr-3"
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
                  Tambah Mobil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
