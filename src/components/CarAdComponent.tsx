import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobilType } from "@/types/mobil";
import { GiGearStickPattern } from "react-icons/gi";
import { IoSpeedometerOutline } from "react-icons/io5";
import { HiMiniWrenchScrewdriver } from "react-icons/hi2";
import { BsFuelPumpDieselFill } from "react-icons/bs";
import { PiCalendar } from "react-icons/pi";

interface CarAdComponentProps {
  mobil: MobilType;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
  showFilter?: boolean;
}

const CarAdComponent: React.FC<CarAdComponentProps> = ({
  mobil,
  onPrevious,
  onNext,
  showNavigation = true,
  showFilter = false,
}) => {
  const router = useRouter();
  const [filters, setFilters] = useState({
    merek: "all",
    transmisi: "all",
    tahun: "all",
  });

  // Filter options
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
  ];

  const transmisiOptions = ["Manual", "Automatic", "Triptonic"];
  const tahunOptions = Array.from({ length: 30 }, (_, i) => 2024 - i);

  // Format harga ke format Indonesia
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID").format(harga);
  };

  // Get main photo or fallback
  const getMainPhoto = () => {
    if (mobil.fotos && mobil.fotos.length > 0) {
      // ✅ Gunakan API route untuk serve images
      return `/api/uploads/${mobil.fotos[0]}`;
    }
    return "/lambang 1.png"; // fallback image
  };

  // Format tanggal pajak ke format Indonesia
  const formatTanggalPajak = (tanggal: string) => {
    if (!tanggal) return "Tidak tersedia";

    const bulanIndonesia = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const date = new Date(tanggal);
    const hari = date.getDate();
    const bulan = bulanIndonesia[date.getMonth()];
    const tahun = date.getFullYear();

    return `${hari}-${bulan}-${tahun}`;
  };

  // Truncate description if too long
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    const { merek, transmisi, tahun } = filters;
    const searchPath = `/mobil/${merek}/${transmisi}/${tahun}`;
    router.push(searchPath);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden shadow-2xl">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Main Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${getMainPhoto()}')`,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 h-full flex">
        {/* Left Side - Car Info Cards */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="space-y-4 ml-40">
            {/* Transmission */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 w-36 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-2">
                <GiGearStickPattern className="w-12 h-8 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-sm font-medium">
                Transmisi
              </span>
              <div className="text-white font-bold text-lg">
                {mobil.transmisi}
              </div>
            </div>

            {/* Mileage */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 w-36 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-2">
                <IoSpeedometerOutline className="w-12 h-8 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-sm font-medium">
                Kilometer
              </span>
              <div className="text-white font-bold text-lg">
                {mobil.kilometer} KM
              </div>
            </div>

            {/* Year */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 w-36 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-2">
                <HiMiniWrenchScrewdriver className="w-12 h-8 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-sm font-medium">Tahun</span>
              <div className="text-white font-bold text-lg">{mobil.tahun}</div>
            </div>

            {/* Fuel */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 w-36 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-2">
                <BsFuelPumpDieselFill className="w-12 h-8 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-sm font-medium">
                Bahan Bakar
              </span>
              <div className="text-white font-bold text-lg">
                {mobil.bahan_bakar}
              </div>
            </div>

            {/* Tax Expiry */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-xl p-4 w-36 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-2">
                <PiCalendar className="w-12 h-8 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-sm font-medium">Pajak</span>
              <div className="text-white font-bold text-lg">
                {formatTanggalPajak(mobil.pajak)}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Main Content */}
        <div className="flex-1 flex flex-col h-70 mt-45 mr-96">
          {/* Car Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
            {`${mobil.merek} ${mobil.tipe}`.toUpperCase()}
          </h1>

          {/* Description */}
          {mobil.deskripsi && (
            <p className="text-white text-sm md:text-base mb-3 max-w-md leading-relaxed opacity-90 bg-[rgba(15,23,42,0.5)]">
              {truncateDescription(mobil.deskripsi)}
            </p>
          )}

          {/* Price */}
          <div className="text-orange-400 text-2xl md:text-3xl font-bold mb-3">
            Rp.{formatHarga(mobil.harga)}
          </div>

          {/* Button */}
          <Link href={`/detailmobilcs/${mobil._id}`}>
            <button className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl">
              Lihat Detail
            </button>
          </Link>
        </div>

        {/* Right Side - Car Image */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative w-full h-full max-w-sm">
            <div className=""></div>
          </div>
        </div>
      </div>

      {/* Integrated Search Filter - Positioned at bottom center */}
      {showFilter && (
        <div className="absolute bottom-17 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 px-8 py-5 w-screen max-w-[50vw]">
            <div className="flex items-center gap-6 justify-center">
              {/* Merek Dropdown */}
              <div className="relative flex-1 max-w-40">
                <select
                  value={filters.merek}
                  onChange={(e) => handleFilterChange("merek", e.target.value)}
                  className="appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-base font-medium cursor-pointer pr-8 pl-3 py-2 w-full"
                >
                  <option value="all">Merek</option>
                  {merekOptions.map((merek) => (
                    <option key={merek} value={merek}>
                      {merek}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

              {/* Separator */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Transmisi Dropdown */}
              <div className="relative flex-1 max-w-40">
                <select
                  value={filters.transmisi}
                  onChange={(e) =>
                    handleFilterChange("transmisi", e.target.value)
                  }
                  className="appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-base font-medium cursor-pointer pr-8 pl-3 py-2 w-full"
                >
                  <option value="all">Transmisi</option>
                  {transmisiOptions.map((transmisi) => (
                    <option key={transmisi} value={transmisi}>
                      {transmisi}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

              {/* Separator */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Tahun Dropdown */}
              <div className="relative flex-1 max-w-32">
                <select
                  value={filters.tahun}
                  onChange={(e) => handleFilterChange("tahun", e.target.value)}
                  className="appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-base font-medium cursor-pointer pr-8 pl-3 py-2 w-full"
                >
                  <option value="all">Tahun</option>
                  {tahunOptions.map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-3 text-base whitespace-nowrap"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Cari Mobil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-600 bg-opacity-70 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-600 bg-opacity-70 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-black" />
          </button>
        </>
      )}
    </div>
  );
};

export default CarAdComponent;
