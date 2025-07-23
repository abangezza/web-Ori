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
  const truncateDescription = (text: string, maxLength: number = 100) => {
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

      {/* Content Container - Centered with max width */}
      <div className="relative z-10 h-full max-w-7xl mx-auto flex px-4">
        {/* Left Side - Car Info Cards */}
        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="space-y-3 ml-8 lg:ml-16">
            {/* Transmission */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-lg p-3 w-32 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-1">
                <GiGearStickPattern className="w-6 h-6 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-xs font-medium">
                Transmisi
              </span>
              <div className="text-white font-bold text-sm">
                {mobil.transmisi}
              </div>
            </div>

            {/* Mileage */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-lg p-3 w-32 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-1">
                <IoSpeedometerOutline className="w-6 h-6 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-xs font-medium">
                Kilometer
              </span>
              <div className="text-white font-bold text-sm">
                {mobil.kilometer}
              </div>
            </div>

            {/* Year */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-lg p-3 w-32 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-1">
                <HiMiniWrenchScrewdriver className="w-6 h-6 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-xs font-medium">Tahun</span>
              <div className="text-white font-bold text-sm">{mobil.tahun}</div>
            </div>

            {/* Fuel */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-lg p-3 w-32 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-1">
                <BsFuelPumpDieselFill className="w-6 h-6 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-xs font-medium">
                Bahan Bakar
              </span>
              <div className="text-white font-bold text-sm">
                {mobil.bahan_bakar}
              </div>
            </div>

            {/* Tax Expiry */}
            <div className="bg-slate-900 opacity-70 bg-opacity-20 backdrop-blur-sm rounded-lg p-3 w-32 hover:bg-opacity-30 transition-all duration-300">
              <div className="flex items-center mb-1">
                <PiCalendar className="w-6 h-6 text-gray-300 mr-2" />
              </div>
              <span className="text-gray-300 text-xs font-medium">Pajak</span>
              <div className="text-white font-bold text-sm">
                {formatTanggalPajak(mobil.pajak)}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Main Car Info in Overlay */}
        <div className="flex-1 flex justify-center items-center relative">
          <div className="absolute top-20 max-w-sm w-full mx-4 mr-80">
            {/* Layer transparan background */}
            <div className="absolute inset-0 bg-gray-800 opacity-40 backdrop-blur-sm rounded-xl z-0"></div>

            {/* Isi Card */}
            <div className="relative z-10 rounded-xl p-6 text-nop">
              {/* Car Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3 text-center">
                {`${mobil.merek} ${mobil.tipe}`.toUpperCase()}
              </h1>

              {/* Description */}
              {mobil.deskripsi && (
                <p className="text-white text-sm mb-4 leading-relaxed opacity-90 text-center">
                  {truncateDescription(mobil.deskripsi)}
                </p>
              )}

              {/* Price */}
              <div className="text-orange-400 text-xl lg:text-2xl font-bold mb-4 text-center">
                Rp.{formatHarga(mobil.harga)}
              </div>

              {/* Button */}
              <Link href={`/detailmobilcs/${mobil._id}`}>
                <button className="w-full bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl">
                  Lihat Detail
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Empty space for balance */}
        <div className="flex-1"></div>
      </div>

      {/* Integrated Search Filter - Positioned at bottom center */}
      {showFilter && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-4xl px-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-center gap-3 flex-wrap lg:flex-nowrap">
              {/* Merek Dropdown */}
              <div className="relative flex-1 min-w-32">
                <select
                  value={filters.merek}
                  onChange={(e) => handleFilterChange("merek", e.target.value)}
                  className="appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-6 pl-2 py-2 w-full"
                >
                  <option value="all">Merek</option>
                  {merekOptions.map((merek) => (
                    <option key={merek} value={merek}>
                      {merek}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
              <div className="hidden lg:block w-px h-6 bg-gray-300"></div>

              {/* Transmisi Dropdown */}
              <div className="relative flex-1 min-w-32">
                <select
                  value={filters.transmisi}
                  onChange={(e) =>
                    handleFilterChange("transmisi", e.target.value)
                  }
                  className="appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-6 pl-2 py-2 w-full"
                >
                  <option value="all">Transmisi</option>
                  {transmisiOptions.map((transmisi) => (
                    <option key={transmisi} value={transmisi}>
                      {transmisi}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
              <div className="hidden lg:block w-px h-6 bg-gray-300"></div>

              {/* Tahun Dropdown */}
              <div className="relative flex-1 min-w-24">
                <select
                  value={filters.tahun}
                  onChange={(e) => handleFilterChange("tahun", e.target.value)}
                  className="appearance-none bg-transparent border-none focus:outline-none text-gray-700 text-sm font-medium cursor-pointer pr-6 pl-2 py-2 w-full"
                >
                  <option value="all">Tahun</option>
                  {tahunOptions.map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <svg
                  className="w-4 h-4"
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
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-600 bg-opacity-70 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}
    </div>
  );
};

export default CarAdComponent;
