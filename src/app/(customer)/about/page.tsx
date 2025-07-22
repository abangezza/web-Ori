// src/app/about/page.tsx
'use client';

import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Users, Handshake, Award, Clock, Shield, Star } from 'lucide-react';

const AboutPage = () => {
  const [question, setQuestion] = useState('');

  // Team members data
  const teamMembers = [
    {
      name: "Ahmad Reza",
      position: "Founder & CEO",
      image: "/team/ceo.jpg",
      description: "Pengalaman 15 tahun di industri otomotif"
    },
    {
      name: "Siti Nurhaliza",
      position: "Sales Manager",
      image: "/team/sales.jpg", 
      description: "Expert dalam konsultasi dan penjualan mobil"
    },
    {
      name: "Budi Santoso",
      position: "Service Manager",
      image: "/team/service.jpg",
      description: "Spesialis perawatan dan perbaikan kendaraan"
    },
    {
      name: "Maya Indira",
      position: "Customer Relations",
      image: "/team/customer.jpg",
      description: "Mengutamakan kepuasan pelanggan"
    }
  ];

  // Partners data
  const partners = [
    { name: "Toyota", logo: "/partners/toyota.png" },
    { name: "Honda", logo: "/partners/honda.png" },
    { name: "Suzuki", logo: "/partners/suzuki.png" },
    { name: "Nissan", logo: "/partners/nissan.png" },
    { name: "Mitsubishi", logo: "/partners/mitsubishi.png" },
    { name: "Daihatsu", logo: "/partners/daihatsu.png" }
  ];

  // Company stats
  const stats = [
    { number: "10+", label: "Tahun Pengalaman", icon: Clock },
    { number: "5000+", label: "Pelanggan Puas", icon: Users },
    { number: "2", label: "Lokasi Showroom", icon: MapPin },
    { number: "100%", label: "Garansi Kualitas", icon: Shield }
  ];

  const handleWhatsAppClick = () => {
    const message = question || "Halo, saya tertarik dengan layanan Radja Auto Car";
    const whatsappUrl = `https://wa.me/628111110067?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-black rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <img
              src="/Lambang bulat.png"
              alt="Radja Auto Car"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Tentang Radja Auto Car
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Dealer mobil terpercaya dengan pengalaman lebih dari 10 tahun dalam memberikan 
            pelayanan terbaik untuk kebutuhan kendaraan impian Anda.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
              Mengapa Memilih Radja Auto Car?
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin</h3>
                      <p className="text-gray-600">Setiap mobil telah melalui inspeksi ketat untuk memastikan kualitas terbaik bagi pelanggan.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Pelayanan Prima</h3>
                      <p className="text-gray-600">Tim profesional kami siap membantu Anda menemukan mobil yang sesuai dengan kebutuhan dan budget.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Transaksi Aman</h3>
                      <p className="text-gray-600">Proses jual beli yang transparan dan aman dengan dokumentasi lengkap dan legal.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Visi & Misi</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-orange-600 mb-2">Visi</h4>
                    <p className="text-gray-600">Menjadi dealer mobil terdepan dan terpercaya di Indonesia yang memberikan solusi kendaraan terbaik untuk setiap keluarga.</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-orange-600 mb-2">Misi</h4>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Menyediakan mobil berkualitas dengan harga kompetitif</li>
                      <li>• Memberikan pelayanan profesional dan ramah</li>
                      <li>• Membangun kepercayaan jangka panjang dengan pelanggan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Tim Profesional Kami</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dikelola oleh tim berpengalaman yang berkomitmen memberikan layanan terbaik
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{member.name}</h3>
                <p className="text-orange-600 font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Mitra Kerja Sama</h2>
            <p className="text-xl text-gray-600">Bekerja sama dengan brand-brand terkemuka</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">{partner.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Lokasi Showroom</h2>
            <p className="text-xl text-gray-600">Kunjungi showroom kami di 2 lokasi</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Location 1 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
              <div className="h-64 bg-gray-300 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.036842750087!2d110.40831197412458!3d-7.777851092233097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a584c039d4c27%3A0x1e06e3f9cc1e6b8d!2sRadja%20Auto%20Car!5e0!3m2!1sen!2sid!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Radja Auto Car 1</h3>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    Jl. Raya Sorum No. 123, Yogyakarta
                  </p>
                </div>
                <a
                  href="https://g.co/kgs/kg1d6ed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Buka di Google Maps
                </a>
              </div>
            </div>

            {/* Location 2 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
              <div className="h-64 bg-gray-300 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.136842750087!2d110.41831197412458!3d-7.787851092233097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a584c039d4c27%3A0x1e06e3f9cc1e6b8e!2sRadja%20Auto%20Car%202!5e0!3m2!1sen!2sid!4v1234567890124"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Radja Auto Car 2</h3>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    Jl. Sorum Utara No. 456, Yogyakarta
                  </p>
                </div>
                <a
                  href="https://g.co/kgs/NskezEV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Hubungi Kami</h2>
              <p className="text-xl text-gray-300">Ada pertanyaan? Jangan ragu untuk bertanya!</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-600 rounded-full p-3">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">Telepon & WhatsApp</p>
                        <p className="text-gray-300">+62 811-1110-067</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-600 rounded-full p-3">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">Jam Operasional</p>
                        <p className="text-gray-300">Senin - Sabtu: 08.00 - 17.00</p>
                        <p className="text-gray-300">Minggu: 08.00 - 15.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Question Form */}
              <div className="bg-gray-800 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Kirim Pertanyaan</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pertanyaan Anda</label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Tulis pertanyaan Anda di sini..."
                      className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-gray-400 resize-none"
                      rows={4}
                    />
                  </div>
                  
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Kirim via WhatsApp
                  </button>
                  
                  <p className="text-sm text-gray-400 text-center">
                    Akan mengarahkan ke WhatsApp untuk chat langsung dengan tim kami
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