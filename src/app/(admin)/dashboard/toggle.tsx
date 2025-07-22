'use client';

import { useState } from "react";
import { MdCarRental } from "react-icons/md";
import TambahMobilPage from "@/components/tambahMobil"; // Update import path

export default function Toggle() {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0); // Key untuk force re-render form
  
  const handleToggle = () => {
    setVisible(!visible);
    // Reset form ketika dibuka/ditutup
    if (!visible) {
      setKey(prev => prev + 1);
    }
  };

  const handleFormSuccess = () => {
    // Tutup modal dan reset form
    setVisible(false);
    setKey(prev => prev + 1); // Force re-render untuk reset form
  };

  return (
    <div className="">
      <div className="container mx-auto flex justify-between py-5 border-b">
        <div className="left flex gap-2">
          <button 
            onClick={handleToggle} 
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-300 cursor-pointer"
          >
            {visible ? 'Tutup Form' : 'Tambah Mobil'}
            <MdCarRental size={25} />
          </button>
        </div>
      </div>

      {/* Full overlay modal when form is visible */}
      {visible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
          <div className="relative min-h-screen">
            {/* Close button */}
            <button
              onClick={handleToggle}
              className="fixed top-4 right-4 z-60 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200"
            >
              ✕ Tutup Form
            </button>
            
            {/* Form container */}
            <div className="relative">
              <TambahMobilPage 
                key={key} // Force re-render untuk reset form
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}