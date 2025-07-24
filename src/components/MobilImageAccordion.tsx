// src/components/MobilImageAccordion.tsx - Updated Version with Mobile Detector
"use client";

import React, { useState, useEffect } from "react";
import MobileImageSwiper from "./MobileImageSwiper";

interface MobilImageAccordionProps {
  fotos: string[];
  mobilName: string;
  onImageClick?: (imageIndex: number) => void;
}

const MobilImageAccordion: React.FC<MobilImageAccordionProps> = ({
  fotos,
  mobilName,
  onImageClick,
}) => {
  const [loadErrors, setLoadErrors] = useState<Set<number>>(new Set());
  const [loadingStates, setLoadingStates] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Handle image load error
  const handleImageError = (index: number) => {
    console.error(`❌ Image ${index + 1} load error:`, fotos[index]);
    setLoadErrors((prev) => new Set([...prev, index]));
    setLoadingStates((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // Handle image load success
  const handleImageLoad = (index: number) => {
    console.log(`✅ Image ${index + 1} loaded successfully:`, fotos[index]);
    if (loadErrors.has(index)) {
      setLoadErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
    setLoadingStates((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  if (!fotos || fotos.length === 0) {
    return (
      <div className="mb-6">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-600">Tidak ada foto tersedia</p>
        </div>
      </div>
    );
  }

  // Render mobile swiper for mobile devices
  if (isMobile) {
    return (
      <MobileImageSwiper
        fotos={fotos}
        mobilName={mobilName}
        onImageClick={onImageClick}
      />
    );
  }

  // Render desktop accordion for larger screens
  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <h4 className="font-bold mb-2 text-center">
          🎯 Click Foto untuk Melihat Gambar Secara Full
        </h4>
        <div className="flex gap-2 h-96 overflow-hidden">
          {fotos.map((foto, i) => (
            <div
              key={`desktop-${i}`}
              className="flex-1 min-w-0 cursor-pointer rounded-lg overflow-hidden hover:flex-[2] transition-all duration-300 relative"
              onClick={() => onImageClick?.(i)}
              style={{
                backgroundColor: "#f3f4f6",
                border: "2px solid #e5e7eb",
              }}
            >
              <img
                src={`/api/uploads/${foto}`}
                alt={`${mobilName} - Foto ${i + 1}`}
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad(i)}
                onError={() => handleImageError(i)}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  height: "100%",
                }}
              />
              {/* Image number overlay */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-center mt-3">
        <span className="text-sm text-gray-500">
          {fotos.length} foto tersedia
          {loadErrors.size > 0 && (
            <span className="text-red-500 ml-1">({loadErrors.size} error)</span>
          )}
          {loadingStates.size > 0 && (
            <span className="text-blue-500 ml-1">
              ({loadingStates.size} loading)
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default MobilImageAccordion;
