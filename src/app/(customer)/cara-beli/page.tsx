// src/app/carabeli/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Car, 
  FileText, 
  Phone, 
  MessageCircle,
  ArrowRight,
  Clock,
  Shield,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CaraBeliPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Steps data dengan detail lengkap
  const buyingSteps = [
    {
      id: 1,
      title: "Pilih Mobil Impian",
      subtitle: "Jelajahi koleksi mobil terlengkap kami",
      description: "Calon pembeli dapat melihat daftar unit mobil atau motor yang tersedia pada website resmi Radja Auto Car. Filter berdasarkan merek, harga, tahun, dan spesifikasi yang diinginkan.",
      icon: Search,
      color: "bg-blue-500",
      features: [
        "Katalog online lengkap dengan foto HD",
        "Filter pencarian berdasarkan budget",
        "Spesifikasi detail setiap unit",
        "History perawatan kendaraan"
      ],
      action: "Mulai Pencarian",
      actionLink: "/mobil/tersedia"
    },
    {
      id: 2,
      title: "Negosiasi & Konsultasi",
      subtitle: "Dapatkan harga terbaik dengan tim ahli kami",
      description: "Calon pembeli melakukan negosiasi kredit/cash dengan Admin showroom. Tim profesional kami siap membantu mencarikan solusi pembiayaan terbaik sesuai kemampuan Anda.",
      icon: Calendar,
      color: "bg-orange-500",
      features: [
        "Konsultasi gratis dengan sales expert",
        "Simulasi kredit dengan berbagai bank",
        "Negosiasi harga yang fair dan transparan",
        "Pilihan paket pembiayaan fleksibel"
      ],
      action: "Jadwalkan Konsultasi",
      actionLink: "https://wa.me/628111110067?text=Halo, saya ingin konsultasi pembelian mobil"
    },
    {
      id: 3,
      title: "Proses Pembayaran",
      subtitle: "Sistem pembayaran aman dan terpercaya",
      description: "Calon pembeli melakukan pembayaran jika harga yang di ajukan sudah sesuai dan sudah terkonfirmasi oleh pihak showroom. Proses pembayaran dapat dilakukan secara cash atau kredit.",
      icon: CreditCard,
      color: "bg-green-500",
      features: [
        "Pembayaran cash atau kredit tersedia",
        "Kerjasama dengan bank terpercaya",
        "Proses approval kredit yang cepat",
        "Sistem pembayaran yang aman"
      ],
      action: "Info Pembayaran",
      actionLink: "/pembayaran"
    },
    {
      id: 4,
      title: "Dokumentasi & Serah Terima",
      subtitle: "Pengurusan dokumen lengkap dan legal",
      description: "Pembeli mendapatkan bukti/kuitansi pembelian dari pihak showroom. Proses balik nama, pengurusan STNK, dan dokumen legal lainnya ditangani profesional.",
      icon: FileText,
      color: "bg-purple-500",
      features: [
        "Pengurusan balik nama BPKB",
        "Perpanjangan STNK otomatis",
        "Asuransi kendaraan (opsional)",
        "Garansi dokumen legal"
      ],
      action: "Lihat Dokumen",
      actionLink: "/dokumen"
    },
    {
      id: 5,
      title: "Penyerahan Kendaraan",
      subtitle: "Terima mobil impian Anda",
      description: "Customer menerima unit yang di beli. Pihak showroom mengantarkan unit langsung ke rumah customer atau customer bisa langsung datang ke showroom untuk mengambil unit yang sudah dilunas.",
      icon: Car,
      color: "bg-indigo-500",
      features: [
        "Pengantaran gratis ke rumah (area tertentu)",
        "Inspeksi kendaraan bersama customer",
        "Panduan penggunaan lengkap",
        "After-sales service support"
      ],
      action: "Hubungi Kami",
      actionLink: "https://wa.me/628111110067?text=Halo, saya ingin informasi pengantaran kendaraan"
    }
  ];

  // FAQ Data
  const faqs = [
    {
      question: "Apakah bisa beli secara kredit?",
      answer: "Ya, kami bekerja sama dengan berbagai bank dan leasing untuk memberikan pilihan kredit terbaik. DP mulai dari 20% dengan tenor hingga 5 tahun."
    },
    {
      question: "Berapa lama proses kredit disetujui?",
      answer: "Proses approval kredit biasanya 1-3 hari kerja, tergantung kelengkapan dokumen dan bank yang dipilih."
    },
    {
      question: "Apakah ada garansi untuk mobil bekas?",
      answer: "Ya, semua mobil bekas kami telah melalui inspeksi menyeluruh dan diberikan garansi mesin selama 3 bulan."
    },
    {
      question: "Bisakah melakukan test drive sebelum membeli?",
      answer: "Tentu saja! Kami sangat menganjurkan test drive untuk memastikan kenyamanan dan performa kendaraan."
    },
    {
      question: "Bagaimana dengan after-sales service?",
      answer: "Kami menyediakan layanan after-sales termasuk service berkala, spare part original, dan konsultasi teknis."
    }
  ];

  // Benefits data
  const benefits = [
    {
      icon: Shield,
      title: "Transaksi Aman",
      description: "Dokumen legal lengkap dan proses transparan"
    },
    {
      icon: Award,
      title: "Kualitas Terjamin",
      description: "Setiap unit telah melalui inspeksi menyeluruh"
    },
    {
      icon: Clock,
      title: "Proses Cepat",
      description: "Penyelesaian dalam 1-7 hari kerja"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-black rounded-full p-4 mr-4">
              <img src="/Lambang bulat.png" alt="Radja Auto Car" className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-bold">Cara Beli di Radja Auto Car</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Sebelum membeli unit, peserta diwajibkan membaca dan memahami peraturan dan cara pembelian.
          </p>
          <div className="mt-8">
            <a 
              href="#steps" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-3"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="steps" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">5 Langkah Mudah Membeli Mobil</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Proses pembelian yang transparan dan mudah dipahami
            </p>
          </div>

          {/* Desktop Steps View */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-20 left-0 right-0 h-1 bg-gray-300">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(activeStep / (buyingSteps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-between items-center mb-12">
                {buyingSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setActiveStep(index)}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                      index <= activeStep ? step.color : 'bg-gray-300'
                    }`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className={`text-sm font-medium text-center max-w-24 ${
                      index <= activeStep ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Step Content */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium mb-4 ${buyingSteps[activeStep].color}`}>
                      Langkah {activeStep + 1}
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-800">
                      {buyingSteps[activeStep].title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {buyingSteps[activeStep].description}
                    </p>
                    <a 
                      href={buyingSteps[activeStep].actionLink}
                      className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-bold transition-colors ${buyingSteps[activeStep].color} hover:opacity-90`}
                    >
                      {buyingSteps[activeStep].action}
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                  <div>
                    <ul className="space-y-3">
                      {buyingSteps[activeStep].features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Steps View */}
          <div className="lg:hidden space-y-6">
            {buyingSteps.map((step, index) => (
              <div key={step.id} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Langkah {index + 1}</div>
                    <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {step.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <a 
                  href={step.actionLink}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${step.color} hover:opacity-90`}
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-800">Pertanyaan Umum</h2>
              <p className="text-xl text-gray-600">Jawaban untuk pertanyaan yang sering ditanyakan</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Siap Membeli Mobil Impian?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tim profesional kami siap membantu Anda menemukan mobil yang tepat dengan proses yang mudah dan aman.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href="/mobil/tersedia"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-3"
            >
              <Search className="w-5 h-5" />
              Lihat Mobil Tersedia
            </a>
            <a 
              href="https://wa.me/628111110067?text=Halo, saya tertarik untuk membeli mobil di Radja Auto Car"
              className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              Konsultasi WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CaraBeliPage;