// src/app/(customer)/about/page.tsx - Updated with Photos and Maps
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
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

const AboutPage = () => {
  const [question, setQuestion] = useState("");

  // Stats data
  const stats = [
    { number: "6+", label: "Tahun Pengalaman", icon: Clock },
    { number: "200+", label: "Pelanggan Puas", icon: Users },
    { number: "2", label: "Lokasi Showroom", icon: MapPin },
    { number: "100%", label: "Garansi Kualitas", icon: Shield },
  ];

  // Team members data with photos
  const teamMembers = [
    {
      name: "Ezza Sulthany Fahman",
      position: "Founder & CEO",
      description: "Pengalaman 10 tahun di industri otomotif",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
    },
    {
      name: "Farhan Azziyad Fahman",
      position: "CO-Founder & CTO",
      description: "Expert dalam konsultasi dan penjualan mobil",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
    },
    {
      name: "Zahran Hadzami Rahman",
      position: "Media Social Manager",
      description: "Administrasi dan media sosial",
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format",
    },
    {
      name: "Muhammad Shidqy Fahman",
      position: "Customer Relations",
      description: "Mengutamakan kepuasan pelanggan",
      photo:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face&auto=format",
    },
    {
      name: "Syauqi Zamzami Rahman",
      position: "Marketing Manager",
      description: "Penjualan dan promosi produk",
      photo:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f60?w=150&h=150&fit=crop&crop=face&auto=format",
    },
  ];

  // Showroom locations data
  const showroomLocations = [
    {
      name: "Radja Auto Car 1",
      address: "Lokasi Showroom Pertama",
      googleMapsUrl: "https://g.co/kgs/5UvgWPP",
      embedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.659193796394!2d103.64564!3d1.595833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMzUnNDUuMCJOIDEwM8KwMzgnNDQuMyJF!5e0!3m2!1sen!2sid!4v1234567890!5m2!1sen!2sid",
      phone: "+62 811-1110-067",
      hours: "Senin - Sabtu: 08.00 - 21.00",
    },
    {
      name: "Radja Auto Car 2",
      address: "Lokasi Showroom Kedua",
      googleMapsUrl: "https://g.co/kgs/s8XQdoD",
      embedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.659193796394!2d103.64564!3d1.595833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMzUnNDUuMCJOIDEwM8KwMzgnNDQuMyJF!5e0!3m2!1sen!2sid!4v1234567891!5m2!1sen!2sid",
      phone: "+62 811-1110-067",
      hours: "Minggu: 08.00 - 22.00",
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

  const handleLocationClick = (url: string) => {
    window.open(url, "_blank");
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
            Tentang <br />
            Radja Auto Car
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

      {/* Team Section - Updated with Photos */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-4 lg:p-6 text-center hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Photo */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-4">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover border-4 border-orange-200"
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                </div>

                <h3 className="text-lg lg:text-xl font-semibold mb-1 lg:mb-2 text-gray-800 break-words">
                  {member.name}
                </h3>
                <p className="text-orange-600 font-medium mb-2 lg:mb-3 text-sm lg:text-base">
                  {member.position}
                </p>
                <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom Locations Section - New */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Lokasi Showroom Kami
            </h2>
            <p className="text-base lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Kunjungi showroom kami untuk melihat langsung koleksi mobil
              terbaik
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {showroomLocations.map((location, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Map Embed */}
                <div className="relative h-64 lg:h-80 bg-gray-200">
                  <iframe
                    src={location.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  ></iframe>
                </div>

                {/* Location Info */}
                <div className="p-6 lg:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                      {location.name}
                    </h3>
                    <button
                      onClick={() =>
                        handleLocationClick(location.googleMapsUrl)
                      }
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buka di Maps
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-sm lg:text-base">
                        {location.address}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-sm lg:text-base">
                        {location.phone}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-sm lg:text-base">
                        {location.hours}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleLocationClick(location.googleMapsUrl)}
                    className="w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Lihat Rute ke Lokasi
                  </button>
                </div>
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
                          Senin - Sabtu: 08.00 - 21.00
                        </p>
                        <p className="text-gray-300 text-sm lg:text-base">
                          Minggu: 08.00 - 22.00
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
