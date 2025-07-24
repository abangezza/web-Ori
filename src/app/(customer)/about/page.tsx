// src/app/(customer)/about/page.tsx - Key Responsive Sections
"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Users,
  Award,
  Clock,
  Shield,
  Star,
} from "lucide-react";
import Image from "next/image";

const AboutPage = () => {
  const [question, setQuestion] = useState("");

  // Stats data
  const stats = [
    { number: "10+", label: "Tahun Pengalaman", icon: Clock },
    { number: "5000+", label: "Pelanggan Puas", icon: Users },
    { number: "2", label: "Lokasi Showroom", icon: MapPin },
    { number: "100%", label: "Garansi Kualitas", icon: Shield },
  ];

  // Team members data
  const teamMembers = [
    {
      name: "Ahmad Reza",
      position: "Founder & CEO",
      description: "Pengalaman 15 tahun di industri otomotif",
    },
    {
      name: "Siti Nurhaliza",
      position: "Sales Manager",
      description: "Expert dalam konsultasi dan penjualan mobil",
    },
    {
      name: "Budi Santoso",
      position: "Service Manager",
      description: "Spesialis perawatan dan perbaikan kendaraan",
    },
    {
      name: "Maya Indira",
      position: "Customer Relations",
      description: "Mengutamakan kepuasan pelanggan",
    },
  ];

  const handleWhatsAppClick = () => {
    const message =
      question || "Halo, saya tertarik dengan layanan Radja Auto Car";
    const whatsappUrl = `https://wa.me/628111110067?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Hero Section - Responsive */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="bg-black rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6 flex items-center justify-center shadow-2xl">
            <Image
              src="/lambang bulat.png"
              alt="Radja Auto Car"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16"
              unoptimized
            />
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 lg:mb-4"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Tentang Radja Auto Car
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
            Dealer mobil terpercaya dengan pengalaman lebih dari 10 tahun dalam
            memberikan pelayanan terbaik untuk kebutuhan kendaraan impian Anda.
          </p>
        </div>
      </section>

      {/* Stats Section - Responsive Grid */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-100 rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 lg:mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Introduction - Responsive Layout */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12 text-gray-800">
              Mengapa Memilih Radja Auto Car?
            </h2>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="space-y-6 lg:space-y-8">
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="bg-orange-100 rounded-full p-2 lg:p-3 flex-shrink-0">
                      <Award className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-semibold mb-2">
                        Kualitas Terjamin
                      </h3>
                      <p className="text-sm lg:text-base text-gray-600">
                        Setiap mobil telah melalui inspeksi ketat untuk
                        memastikan kualitas terbaik bagi pelanggan.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="bg-orange-100 rounded-full p-2 lg:p-3 flex-shrink-0">
                      <Star className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-semibold mb-2">
                        Pelayanan Prima
                      </h3>
                      <p className="text-sm lg:text-base text-gray-600">
                        Tim profesional kami siap membantu Anda menemukan mobil
                        yang sesuai dengan kebutuhan dan budget.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="bg-orange-100 rounded-full p-2 lg:p-3 flex-shrink-0">
                      <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-semibold mb-2">
                        Transaksi Aman
                      </h3>
                      <p className="text-sm lg:text-base text-gray-600">
                        Proses jual beli yang transparan dan aman dengan
                        dokumentasi lengkap dan legal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800">
                  Visi & Misi
                </h3>
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <h4 className="text-base lg:text-lg font-semibold text-orange-600 mb-2">
                      Visi
                    </h4>
                    <p className="text-sm lg:text-base text-gray-600">
                      Menjadi dealer mobil terdepan dan terpercaya di Indonesia
                      yang memberikan solusi kendaraan terbaik untuk setiap
                      keluarga.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-base lg:text-lg font-semibold text-orange-600 mb-2">
                      Misi
                    </h4>
                    <ul className="text-sm lg:text-base text-gray-600 space-y-1 lg:space-y-2">
                      <li>
                        • Menyediakan mobil berkualitas dengan harga kompetitif
                      </li>
                      <li>• Memberikan pelayanan profesional dan ramah</li>
                      <li>
                        • Membangun kepercayaan jangka panjang dengan pelanggan
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Responsive Grid */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Tim Profesional Kami
            </h2>
            <p className="text-base lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Dikelola oleh tim berpengalaman yang berkomitmen memberikan
              layanan terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-4 lg:p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-300 rounded-full mx-auto mb-3 lg:mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 lg:w-12 lg:h-12 text-gray-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold mb-1 lg:mb-2 text-gray-800">
                  {member.name}
                </h3>
                <p className="text-orange-600 font-medium mb-2 lg:mb-3 text-sm lg:text-base">
                  {member.position}
                </p>
                <p className="text-gray-600 text-xs lg:text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Responsive Layout */}
      <section className="py-12 lg:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Hubungi Kami
              </h2>
              <p className="text-base lg:text-xl text-gray-300">
                Ada pertanyaan? Jangan ragu untuk bertanya!
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Info */}
              <div className="space-y-6 lg:space-y-8">
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">
                    Informasi Kontak
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="bg-orange-600 rounded-full p-2 lg:p-3">
                        <Phone className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm lg:text-base">
                          Telepon & WhatsApp
                        </p>
                        <p className="text-gray-300 text-sm lg:text-base">
                          +62 811-1110-067
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="bg-orange-600 rounded-full p-2 lg:p-3">
                        <Clock className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm lg:text-base">
                          Jam Operasional
                        </p>
                        <p className="text-gray-300 text-sm lg:text-base">
                          Senin - Sabtu: 08.00 - 17.00
                        </p>
                        <p className="text-gray-300 text-sm lg:text-base">
                          Minggu: 08.00 - 15.00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Form */}
              <div className="bg-gray-800 rounded-2xl p-6 lg:p-8">
                <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">
                  Kirim Pertanyaan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pertanyaan Anda
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Tulis pertanyaan Anda di sini..."
                      className="w-full p-3 lg:p-4 rounded-lg bg-gray-700 border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-gray-400 resize-none text-sm lg:text-base"
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 lg:py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 text-sm lg:text-base"
                  >
                    <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    Kirim via WhatsApp
                  </button>

                  <p className="text-xs lg:text-sm text-gray-400 text-center">
                    Akan mengarahkan ke WhatsApp untuk chat langsung dengan tim
                    kami
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
