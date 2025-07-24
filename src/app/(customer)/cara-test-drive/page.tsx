// src/app/caratestdrive/page.tsx
import React from "react";
import {
  Search,
  FileText,
  Calendar,
  Car,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  Clock,
  Shield,
  MapPin,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CaraTestDrivePage = () => {
  // Test Drive Steps
  const testDriveSteps = [
    {
      id: 1,
      title: "Lihat Daftar Mobil",
      description:
        "Customer dapat melihat daftar unit mobil atau motor yang tersedia pada website resmi Radja Auto Car.",
      icon: Search,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Isi Form Pendaftaran",
      description:
        "Customer mengisi form yang didaftarkan untuk melakukan test drive.",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Konfirmasi Showroom",
      description:
        "Customer mengkonfirmasi pihak showroom perihal pendaftaran test drive pada mobil dan tanggal yang sudah ditentukan.",
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      id: 4,
      title: "Datang ke Showroom",
      description:
        "Customer datang ke showroom pada tanggal yang sudah ditentukan guna melakukan test drive.",
      icon: Car,
      color: "bg-purple-500",
    },
  ];

  // Requirements
  const requirements = [
    "KTP yang masih berlaku",
    "SIM A yang masih aktif",
    "Usia minimal 21 tahun",
    "Dalam kondisi sehat",
    "Mengikuti instruksi sales",
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-4xl font-bold">
              Cara Test Drive di Radja Auto Car
            </h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Berikut adalah beberapa langkah calon pembeli jika ingin melakukan
            test drive.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              4 Langkah Mudah Test Drive
            </h2>
            <p className="text-gray-600">
              Ikuti langkah-langkah berikut untuk melakukan test drive
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {testDriveSteps.map((step, index) => (
                <div key={step.id} className="text-center">
                  {/* Step Number & Icon */}
                  <div className="relative mb-6">
                    <div
                      className={`w-20 h-20 mx-auto rounded-full ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                      {step.id}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow for desktop */}
                  {index < testDriveSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 right-0 transform translate-x-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Requirements */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Syarat Test Drive
                </h2>
                <p className="text-gray-600 mb-6">
                  Pastikan Anda memenuhi syarat berikut sebelum melakukan test
                  drive:
                </p>
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Info */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Informasi Penting
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Durasi Test Drive
                      </p>
                      <p className="text-gray-600 text-sm">
                        15-30 menit per kendaraan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-gray-800">Keamanan</p>
                      <p className="text-gray-600 text-sm">
                        Didampingi sales berpengalaman
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold text-gray-800">Lokasi</p>
                      <p className="text-gray-600 text-sm">
                        2 showroom tersedia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-semibold text-gray-800">Biaya</p>
                      <p className="text-gray-600 text-sm">Test drive gratis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Pertanyaan Umum
              </h2>
              <p className="text-gray-600">
                Beberapa pertanyaan yang sering ditanyakan
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  Apakah test drive gratis?
                </h3>
                <p className="text-gray-600">
                  Ya, semua test drive di Radja Auto Car tidak dikenakan biaya
                  apapun.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  Berapa lama bisa test drive?
                </h3>
                <p className="text-gray-600">
                  Durasi test drive adalah 15-30 menit, tergantung jenis
                  kendaraan.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  Apakah harus bawa SIM sendiri?
                </h3>
                <p className="text-gray-600">
                  Ya, wajib membawa SIM A yang masih berlaku untuk keamanan.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  Bisa test drive di hari libur?
                </h3>
                <p className="text-gray-600">
                  Bisa, kami buka setiap hari termasuk weekend dengan jam yang
                  berbeda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap untuk Test Drive?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Hubungi kami sekarang untuk menjadwalkan test drive mobil impian
            Anda.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/mobil/tersedia"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-3"
            >
              Lihat Mobil Tersedia
            </Link>
            <a
              href="https://wa.me/628111110067?text=Halo, saya ingin mendaftar test drive"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              Daftar via WhatsApp
            </a>
          </div>

          {/* Contact Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-100">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              <span>+62 811-1110-067</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Senin-Minggu 08:00-17:00</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>2 Lokasi Showroom</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CaraTestDrivePage;
