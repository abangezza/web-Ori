'use client';

import { MobilType } from "@/types/mobil";
import { FaGasPump, FaCalendarAlt, FaCarSide } from "react-icons/fa";
import { MdOutlineAvTimer } from "react-icons/md";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

interface MobilDetailClientProps {
  data: MobilType;
}

interface FormData {
  nama: string;
  nomorWhatsapp: string;
  dp: string;
  tenorCicilan: string;
  angsuran: string;
}

interface BeliCashFormData {
  nama: string;
  nomorWhatsapp: string;
  hargaTawaran: string;
}

interface TestDriveFormData {
  nama: string;
  nomorWhatsapp: string;
  tanggalTest: string;
  waktu: string;
}

export default function MobilDetailClient({ data }: MobilDetailClientProps) {
  const router = useRouter();
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCash, setIsSubmittingCash] = useState(false);
  const [isSubmittingTestDrive, setIsSubmittingTestDrive] = useState(false);
  
  // Check if mobil is sold out
  const isSoldOut = data.status === 'terjual';
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    nomorWhatsapp: '',
    dp: '',
    tenorCicilan: '',
    angsuran: ''
  });

  // Beli Cash form state
  const [cashFormData, setCashFormData] = useState<BeliCashFormData>({
    nama: '',
    nomorWhatsapp: '',
    hargaTawaran: ''
  });

  // Test Drive form state
  const [testDriveFormData, setTestDriveFormData] = useState<TestDriveFormData>({
    nama: '',
    nomorWhatsapp: '',
    tanggalTest: '',
    waktu: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [cashErrors, setCashErrors] = useState<{[key: string]: string}>({});
  const [testDriveErrors, setTestDriveErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCashFormValid, setIsCashFormValid] = useState(false);
  const [isTestDriveFormValid, setIsTestDriveFormValid] = useState(false);

  // Format tanggal pajak ke format Indonesia
  const formatTanggalPajak = (tanggal: string) => {
    if (!tanggal) return 'Tidak tersedia';
    
    const bulanIndonesia = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const date = new Date(tanggal);
    const hari = date.getDate();
    const bulan = bulanIndonesia[date.getMonth()];
    const tahun = date.getFullYear();
    
    return `${hari}-${bulan}-${tahun}`;
  };

  // Validasi nomor WhatsApp Indonesia
  const validateWhatsappNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '');
    const patterns = [
      /^08\d{8,11}$/,
      /^628\d{8,11}$/,
      /^\+628\d{8,11}$/
    ];
    return patterns.some(pattern => pattern.test(number));
  };

  // Format input nomor WhatsApp
  const formatWhatsappNumber = (number: string): string => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('08')) {
      return '+62' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('8')) {
      return '+62' + cleanNumber;
    } else if (cleanNumber.startsWith('628')) {
      return '+' + cleanNumber;
    } else if (cleanNumber.startsWith('62')) {
      return '+' + cleanNumber;
    }
    
    return number;
  };

  // Calculate angsuran based on DP and tenor
  const calculateAngsuran = (dpInput: number, tenor: string): number => {
    const dpDatabase = data.dp;
    const selisihDp = dpInput - dpDatabase;
    
    if (tenor === '4') {
      const pengurangan = selisihDp / 48;
      return data.angsuran_4_thn - pengurangan;
    } else if (tenor === '5') {
      const pengurangan = selisihDp / 60;
      return data.angsuran_5_tahun - pengurangan;
    }
    
    return 0;
  };

  // Handle form changes
  const handleInputChange = (field: string, value: string) => {
    let newErrors = { ...errors };
    let updatedFormData = { ...formData, [field]: value };

    delete newErrors[field];

    if (field === 'nomorWhatsapp') {
      if (value && !validateWhatsappNumber(value)) {
        newErrors.nomorWhatsapp = 'Format nomor WhatsApp tidak valid';
      } else {
        updatedFormData.nomorWhatsapp = formatWhatsappNumber(value);
      }
    }

    if (field === 'dp') {
      const dpValue = parseInt(value.replace(/\D/g, ''));
      if (value && dpValue < data.dp) {
        newErrors.dp = `DP Minimal Mobil Ini Adalah Rp.${data.dp.toLocaleString('id-ID')}`;
      } else if (value && dpValue > data.dp && dpValue < (data.dp + 1000000)) {
        newErrors.dp = 'Penambahan DP Minimal 1 juta';
      } else if (value && dpValue >= data.dp && updatedFormData.tenorCicilan) {
        const angsuran = calculateAngsuran(dpValue, updatedFormData.tenorCicilan);
        updatedFormData.angsuran = Math.round(angsuran).toString();
      }
    }

    if (field === 'tenorCicilan' && updatedFormData.dp) {
      const dpValue = parseInt(updatedFormData.dp.replace(/\D/g, ''));
      if (dpValue >= data.dp && dpValue >= (data.dp + 1000000)) {
        const angsuran = calculateAngsuran(dpValue, value);
        updatedFormData.angsuran = Math.round(angsuran).toString();
      }
    }

    setFormData(updatedFormData);
    setErrors(newErrors);
  };

  // Handle cash form changes
  const handleCashInputChange = (field: string, value: string) => {
    let newCashErrors = { ...cashErrors };
    let updatedCashFormData = { ...cashFormData, [field]: value };

    delete newCashErrors[field];

    if (field === 'nomorWhatsapp') {
      if (value && !validateWhatsappNumber(value)) {
        newCashErrors.nomorWhatsapp = 'Format nomor WhatsApp tidak valid';
      } else {
        updatedCashFormData.nomorWhatsapp = formatWhatsappNumber(value);
      }
    }

    setCashFormData(updatedCashFormData);
    setCashErrors(newCashErrors);
  };

  // Handle test drive form changes
  const handleTestDriveInputChange = (field: string, value: string) => {
    let newTestDriveErrors = { ...testDriveErrors };
    let updatedTestDriveFormData = { ...testDriveFormData, [field]: value };

    delete newTestDriveErrors[field];

    if (field === 'nomorWhatsapp') {
      if (value && !validateWhatsappNumber(value)) {
        newTestDriveErrors.nomorWhatsapp = 'Format nomor WhatsApp tidak valid';
      } else {
        updatedTestDriveFormData.nomorWhatsapp = formatWhatsappNumber(value);
      }
    }

    if (field === 'tanggalTest') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (value && selectedDate < today) {
        newTestDriveErrors.tanggalTest = 'Tanggal test drive tidak boleh di masa lalu';
      }
    }

    setTestDriveFormData(updatedTestDriveFormData);
    setTestDriveErrors(newTestDriveErrors);
  };

  // Validate form
  useEffect(() => {
    const { nama, nomorWhatsapp, dp, tenorCicilan, angsuran } = formData;
    const isValid = nama.trim() !== '' &&
                   nomorWhatsapp.trim() !== '' &&
                   validateWhatsappNumber(nomorWhatsapp) &&
                   dp.trim() !== '' &&
                   tenorCicilan.trim() !== '' &&
                   angsuran.trim() !== '' &&
                   Object.keys(errors).length === 0;
    
    setIsFormValid(isValid);
  }, [formData, errors]);

  // Validate cash form
  useEffect(() => {
    const { nama, nomorWhatsapp, hargaTawaran } = cashFormData;
    const isValid = nama.trim() !== '' &&
                   nomorWhatsapp.trim() !== '' &&
                   validateWhatsappNumber(nomorWhatsapp) &&
                   hargaTawaran.trim() !== '' &&
                   Object.keys(cashErrors).length === 0;
    
    setIsCashFormValid(isValid);
  }, [cashFormData, cashErrors]);

  // Validate test drive form
  useEffect(() => {
    const { nama, nomorWhatsapp, tanggalTest, waktu } = testDriveFormData;
    const isValid = nama.trim() !== '' &&
                   nomorWhatsapp.trim() !== '' &&
                   validateWhatsappNumber(nomorWhatsapp) &&
                   tanggalTest.trim() !== '' &&
                   waktu.trim() !== '' &&
                   Object.keys(testDriveErrors).length === 0;
    
    setIsTestDriveFormValid(isValid);
  }, [testDriveFormData, testDriveErrors]);

  // Handle form submission
  const handleSubmitKredit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      const dpFormatted = parseInt(formData.dp.replace(/\D/g, '')).toLocaleString('id-ID');
      const angsuranFormatted = parseInt(formData.angsuran).toLocaleString('id-ID');
      
      const message = `Hallo bang, saya ${formData.nama}, ingin mengajukan angsuran untuk mobil ${data.tipe} dengan No Polisi ${data.noPol} dengan DP Rp.${dpFormatted}, dan Angsuran Rp.${angsuranFormatted}`;
      
      const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      alert('Terjadi kesalahan saat mengirim pesan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cash form submission with price validation
  const handleSubmitCash = async () => {
    if (!isCashFormValid) return;

    // Check price before submitting
    const hargaTawaranValue = parseInt(cashFormData.hargaTawaran.replace(/\D/g, ''));
    const selisihHarga = data.harga - hargaTawaranValue;
    
    if (selisihHarga > 7000000) {
      setShowNotificationModal(true);
      return;
    }

    setIsSubmittingCash(true);

    try {
      const hargaTawaranFormatted = hargaTawaranValue.toLocaleString('id-ID');
      
      const message = `Hallo bang, saya ${cashFormData.nama}, ingin mengajukan Pembelian Mobil secara Cash, untuk mobil ${data.tipe} dengan No Polisi ${data.noPol} dengan tawaran Rp.${hargaTawaranFormatted}, Apakah Boleh??`;
      
      const whatsappUrl = `https://wa.me/628128706652?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      alert('Terjadi kesalahan saat mengirim pesan');
    } finally {
      setIsSubmittingCash(false);
    }
  };

  // Handle test drive form submission
  const handleSubmitTestDrive = async () => {
    if (!isTestDriveFormValid) return;

    setIsSubmittingTestDrive(true);

    try {
      // Simpan ke database
      const response = await fetch('/api/test-drive-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaCustomer: testDriveFormData.nama,
          noHp: testDriveFormData.nomorWhatsapp,
          mobilId: data._id,
          tanggalTest: testDriveFormData.tanggalTest
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan booking');
      }

      // Format tanggal untuk WhatsApp
      const tanggalFormatted = new Date(testDriveFormData.tanggalTest).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Kirim pesan WhatsApp
      const message = `Hallo bang, saya ${testDriveFormData.nama}, Telah Booking Test Drive, untuk mobil ${data.tipe} dengan No Polisi ${data.noPol} di hari dan tanggal ${tanggalFormatted}, pada ${testDriveFormData.waktu} hari.`;
      
      const whatsappUrl = `https://wa.me/628128706652?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');

      // Reset form setelah berhasil
      setTestDriveFormData({
        nama: '',
        nomorWhatsapp: '',
        tanggalTest: '',
        waktu: ''
      });

      alert('Booking test drive berhasil disimpan!');

    } catch (error) {
      console.error('Error submitting test drive booking:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat booking test drive');
    } finally {
      setIsSubmittingTestDrive(false);
    }
  };

  const openImageModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  const openDescriptionModal = () => {
    setShowDescriptionModal(true);
  };

  const closeDescriptionModal = () => {
    setShowDescriptionModal(false);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
  };

  const handleBackToAvailableCars = () => {
    router.push('/mobil/tersedia');
  };

  return (
    <div className="max-w-8xl mx-auto">
      {/* Photo Accordion - Full Width */}
      <div className="mb-6">
        <style jsx>{`
          .accordion-container {
            display: flex;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            min-height: 420px;
            background: white;
            padding: 0 8px 8px 8px;
            border-radius: 0 0 16px 16px;
            margin: 60px;
            margin-top: 120px;
          }
          
          .accordion-item {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: flex 0.5s ease-in-out;
            flex: 0.5;
            margin: 0 4px;
            border-radius: 9px 9px 9px 9px;
          }
          
          .accordion-item:first-child {
            margin-left: 0;
          }
          
          .accordion-item:last-child {
            margin-right: 0;
          }
          
          .accordion-item:hover {
            flex: 2;
          }
          
          .accordion-image {
            width: 100%;
            height: 420px;
            object-fit: cover;
            transition: transform 0.5s ease;
            border-radius: 0 0 12px 12px;
          }
          
          .accordion-item:hover .accordion-image {
            transform: scale(1.1);
          }
          
          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0);
            transition: background 0.3s ease;
          }
          
          .accordion-item:hover .image-overlay {
            background: rgba(0, 0, 0, 0.2);
          }
          
          .zoom-icon {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            padding: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .accordion-item:hover .zoom-icon {
            opacity: 1;
          }
          
          .zoom-icon:hover {
            background: rgba(255, 255, 255, 0.9);
          }
          
          .image-number {
            position: absolute;
            bottom: 16px;
            left: 16px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 500;
          }
        `}</style>
        
        <div className="accordion-container">
          {data.fotos && data.fotos.length > 0 ? data.fotos.map((foto, i) => (
            <div
              key={i}
              className="accordion-item"
              onClick={() => openImageModal(`/uploads/${foto}`)}
            >
              <img
                src={`/uploads/${foto}`}
                alt={`Foto ${i + 1}`}
                className="accordion-image"
                onError={(e) => {
                  console.error('Error loading image:', `/uploads/${foto}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              <div className="image-overlay" />
              
              <div className="zoom-icon">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
              
              <div className="image-number">
                {i + 1}
              </div>
            </div>
          )) : (
            <div style={{ width: '100%', height: '420px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#6b7280' }}>Tidak ada foto tersedia</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-3">
          <span className="text-sm text-gray-500">
            {data.fotos?.length || 0} foto tersedia - Klik untuk memperbesar
          </span>
        </div>
      </div>

      {/* Content with padding - Centered */}
      <div className="max-w-6xl mx-auto px-6">
        {/* Judul dan Harga */}
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold">{data.merek} {data.tipe} {data.tahun}</h1>
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSoldOut 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isSoldOut ? 'SOLD OUT' : 'TERSEDIA'}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-lg text-gray-500 mb-2">
          <span><MdOutlineAvTimer size={30} color="#006400" className="inline mr-1" /> {data.kilometer}</span>
          <span><FaGasPump size={25} color="#006400" className="inline mr-1" /> {data.bahan_bakar}</span>
          <span><FaCarSide size={28} color="#006400" className="inline mr-1" /> {data.transmisi}</span>
          <span><FaCalendarAlt size={25} color="#006400" className="inline mr-1" /> {formatTanggalPajak(data.pajak)}</span>
        </div>
        <p className="text-orange-600 text-2xl font-bold mb-6">
          Rp.{data.harga.toLocaleString("id-ID")}
        </p>

        {/* Tombol */}
        <div className="mb-6">
          <button 
            onClick={openDescriptionModal}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Deskripsi Unit
          </button>
        </div>

        {/* Detail Kendaraan */}
        <div className="w-full max-w-[1110px] h-auto relative bg-white rounded-[5px] border border-gray-200 p-6 mb-8">
          
          {/* Spesifikasi Kendaraan */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
              <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
                Spesifikasi Kendaraan
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Merk</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Outfit']">{data.merek}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Transmisi</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.transmisi}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Bahan Bakar</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.bahan_bakar}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Nomor Rangka</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.noRangka}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Type</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.tipe}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Kapasitas Mesin (cc)</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.kapasitas_mesin} cc</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Odometer</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.kilometer}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Nomor Mesin</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.noMesin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dokumen Kendaraan */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
              <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
                Dokumen Kendaraan
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
              <div className="space-y-2">
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Nomor Polisi</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.noPol}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">STNK</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.STNK ? "Ada" : "Tidak Ada"}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">BPKB</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.BPKB ? "Ada" : "Tidak Ada"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Warna</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.warna}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Masa Berlaku STNK</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{formatTanggalPajak(data.pajak)}</span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Faktur</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">{data.Faktur ? "Ada" : "Tidak Ada"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hitungan Kredit */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-4 h-3.5 bg-green-900 rounded-lg mr-4"></div>
              <div className="text-green-900 text-lg font-black font-['Inter'] uppercase">
                Hitungan Kredit
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
              <div className="space-y-2">
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Dp (Down Payment)</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">
                    Rp.{typeof data.dp === "number" ? data.dp.toLocaleString("id-ID") : "0"}
                  </span>
                </div>
                
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Angsuran 5 Tahun</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">
                    Rp.{typeof data.angsuran_5_tahun === "number" ? data.angsuran_5_tahun.toLocaleString("id-ID") : "0"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center border-b-2 border-gray-200 pb-1">
                  <span className="w-48 text-black text-lg font-normal font-['Inter']">Angsuran 4 tahun</span>
                  <span className="text-black text-lg font-normal font-['Inter'] mr-4">:</span>
                  <span className="text-black text-lg font-normal font-['Inter']">
                    Rp.{typeof data.angsuran_4_thn === "number" ? data.angsuran_4_thn.toLocaleString("id-ID") : "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONDITIONAL CONTENT BASED ON STATUS */}
        {isSoldOut ? (
          /* SOLD OUT MESSAGE */
          <div className="w-full max-w-[1110px] bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-12 text-center mb-8 border-2 border-red-200">
            <div className="mb-6">
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-3xl font-bold text-red-600 mb-2">Yaahhh... Sayang banget</h2>
              <h3 className="text-2xl font-semibold text-red-500 mb-4">Mobil ini udah SOLD OUT...</h3>
              <p className="text-lg text-gray-600 mb-8">Tapi jangan sedih, masih banyak mobil keren lainnya yang menunggu!</p>
            </div>
            
            <button
              onClick={handleBackToAvailableCars}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚗 Cari Mobil Lain Yuk!
            </button>
          </div>
        ) : (
          /* FORMS FOR AVAILABLE CARS */
          <>
            {/* Simulasi Kredit Form */}
            <div className="w-full max-w-[1110px] bg-gray-50 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulasi Kredit</h2>
              <p className="text-gray-600 mb-6">Berikut adalah Form untuk pengajuan Kredit</p>
              
              <div className="space-y-6">
                {/* Nama */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nama</label>
                  <input
                    type="text"
                    placeholder="Masukan Nama Anda"
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nomer Whatsapp</label>
                  <input
                    type="text"
                    placeholder="Masukan Nomer Hp Anda"
                    value={formData.nomorWhatsapp}
                    onChange={(e) => handleInputChange('nomorWhatsapp', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {errors.nomorWhatsapp && <p className="text-red-500 text-sm mt-1">{errors.nomorWhatsapp}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Down Payment */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Down payment (Dp)</label>
                    <input
                      type="text"
                      placeholder={`*Dp Minimal ${(data.dp || 0).toLocaleString('id-ID')} Rupiah`}
                      value={formData.dp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value ? parseInt(value).toLocaleString('id-ID') : '';
                        handleInputChange('dp', formatted);
                      }}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {errors.dp && <p className="text-red-500 text-sm mt-1">{errors.dp}</p>}
                  </div>

                  {/* Tenor Cicilan */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tenor Cicilan (Tahun)</label>
                    <select
                      value={formData.tenorCicilan}
                      onChange={(e) => handleInputChange('tenorCicilan', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Tentukan Lama Waktu</option>
                      <option value="4">4 Tahun</option>
                      <option value="5">5 Tahun</option>
                    </select>
                  </div>
                </div>

                {/* Request Angsuran */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Request Angsuran</label>
                  <input
                    type="text"
                    placeholder="*Masukan Angsuran yang anda inginkan"
                    value={formData.angsuran ? `Rp.${parseInt(formData.angsuran).toLocaleString('id-ID')}` : ''}
                    readOnly
                    className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitKredit}
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 rounded-xl text-white font-medium transition-colors ${
                    isFormValid && !isSubmitting
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Mengirim...' : 'Ajukan Angsuran'}
                </button>
              </div>
            </div>

            {/* Booking Test Drive Form */}
            <div className="w-full max-w-[1110px] bg-gray-50 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Test Drive</h2>
              <p className="text-gray-600 mb-6">Berikut adalah Form untuk Booking Test Drive</p>
              
              <div className="space-y-6">
                {/* Nama */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nama</label>
                  <input
                    type="text"
                    placeholder="Masukan Nama Anda"
                    value={testDriveFormData.nama}
                    onChange={(e) => handleTestDriveInputChange('nama', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {testDriveErrors.nama && <p className="text-red-500 text-sm mt-1">{testDriveErrors.nama}</p>}
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nomer Whatsapp</label>
                  <input
                    type="text"
                    placeholder="Masukan Nomer Hp Anda"
                    value={testDriveFormData.nomorWhatsapp}
                    onChange={(e) => handleTestDriveInputChange('nomorWhatsapp', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {testDriveErrors.nomorWhatsapp && <p className="text-red-500 text-sm mt-1">{testDriveErrors.nomorWhatsapp}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Waktu */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Waktu</label>
                    <select
                      value={testDriveFormData.waktu}
                      onChange={(e) => handleTestDriveInputChange('waktu', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Waktu Test Drive</option>
                      <option value="pagi">Pagi</option>
                      <option value="siang">Siang</option>
                      <option value="sore">Sore</option>
                    </select>
                    {testDriveErrors.waktu && <p className="text-red-500 text-sm mt-1">{testDriveErrors.waktu}</p>}
                  </div>

                  {/* Tanggal */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={testDriveFormData.tanggalTest}
                      onChange={(e) => handleTestDriveInputChange('tanggalTest', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {testDriveErrors.tanggalTest && <p className="text-red-500 text-sm mt-1">{testDriveErrors.tanggalTest}</p>}
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
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmittingTestDrive ? 'Menyimpan...' : 'Ajukan Test Drive'}
                </button>
              </div>
            </div>

            {/* Beli Cash Form */}
            <div className="w-full max-w-[1110px] bg-gray-50 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Beli Cash</h2>
              <p className="text-gray-600 mb-6">Berikut adalah Form untuk Penawaran Beli Cash</p>
              
              <div className="space-y-6">
                {/* Nama */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nama</label>
                  <input
                    type="text"
                    placeholder="Masukan Nama Anda"
                    value={cashFormData.nama}
                    onChange={(e) => handleCashInputChange('nama', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {cashErrors.nama && <p className="text-red-500 text-sm mt-1">{cashErrors.nama}</p>}
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nomer Whatsapp</label>
                  <input
                    type="text"
                    placeholder="Masukan Nomer Hp Anda"
                    value={cashFormData.nomorWhatsapp}
                    onChange={(e) => handleCashInputChange('nomorWhatsapp', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {cashErrors.nomorWhatsapp && <p className="text-red-500 text-sm mt-1">{cashErrors.nomorWhatsapp}</p>}
                </div>

                {/* Harga Tawaran */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Harga Tawaran</label>
                  <input
                    type="text"
                    placeholder="Isi Harga Tawaran Anda"
                    value={cashFormData.hargaTawaran}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = value ? parseInt(value).toLocaleString('id-ID') : '';
                      handleCashInputChange('hargaTawaran', formatted);
                    }}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {cashErrors.hargaTawaran && <p className="text-red-500 text-sm mt-1">{cashErrors.hargaTawaran}</p>}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitCash}
                  disabled={!isCashFormValid || isSubmittingCash}
                  className={`w-full py-4 rounded-xl text-white font-medium transition-colors ${
                    isCashFormValid && !isSubmittingCash
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmittingCash ? 'Mengirim...' : 'Ajukan Beli Cash'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 transition-all duration-200 shadow-lg border-2 border-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={closeImageModal}
              className="absolute top-4 left-4 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
            >
              ← Kembali
            </button>
            
            <div className="relative max-w-full max-h-full">
              <img
                src={selectedImage}
                alt="Foto Mobil"
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
              />
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {data.fotos && data.fotos.map((foto, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(`/uploads/${foto}`)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    selectedImage === `/uploads/${foto}` 
                      ? 'bg-white' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
            
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-sm font-medium">
              {data.fotos ? data.fotos.indexOf(selectedImage.replace('/uploads/', '')) + 1 : 1} / {data.fotos ? data.fotos.length : 0}
            </div>
          </div>
          
          <div 
            className="absolute inset-0 -z-10" 
            onClick={closeImageModal}
          />
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Deskripsi Unit</h2>
              <button
                onClick={closeDescriptionModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Kendaraan:</h3>
                <p className="text-gray-600">{data.merek} {data.tipe} ({data.tahun})</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Deskripsi:</h3>
                <p className="text-gray-600">
                  {data.deskripsi || "Tidak ada deskripsi tersedia untuk kendaraan ini."}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Spesifikasi Singkat:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Transmisi: {data.transmisi}</li>
                  <li>• Bahan Bakar: {data.bahan_bakar}</li>
                  <li>• Kapasitas Mesin: {data.kapasitas_mesin} cc</li>
                  <li>• Kilometer: {data.kilometer}</li>
                  <li>• Warna: {data.warna}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Harga:</h3>
                <p className="text-orange-600 text-lg font-bold">
                  Rp.{data.harga.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDescriptionModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal for Low Price Offer */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">😅</div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Wah Tawarannya Terlalu Rendah</h3>
              <p className="text-gray-600">
                Harga yang Anda tawarkan terlalu jauh dari harga mobil. 
                Silakan masukkan harga yang lebih realistis.
              </p>
            </div>
            
            <button
              onClick={closeNotificationModal}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Oke, Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};