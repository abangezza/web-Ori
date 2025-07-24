// src/components/MobilImageAccordion.tsx - WORKING VERSION
"use client";

import React, { useState } from "react";

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

  // Handle image load start
  const handleImageLoadStart = (index: number) => {
    console.log(`🔄 Image ${index + 1} started loading:`, fotos[index]);
    setLoadingStates((prev) => new Set([...prev, index]));
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

  return (
    <div className="mb-6">
      {/* Fixed Height with Visible Borders - The Working Solution */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <div
          className="flex gap-2 rounded-lg overflow-hidden"
          style={{
            height: "384px", // Fixed height
            border: "3px solid #ef4444", // Red border for visibility
            backgroundColor: "#fef2f2",
          }}
        >
          {fotos.map((foto, i) => (
            <div
              key={`fixed-${i}`}
              className="relative cursor-pointer transition-all duration-500 hover:flex-[2]"
              onClick={() => onImageClick?.(i)}
              style={{
                flex: "1",
                minWidth: "60px",
                border: "2px solid #3b82f6", // Blue border for each image
                backgroundColor: "#dbeafe",
              }}
            >
              {loadingStates.has(i) && (
                <div className="absolute inset-0 bg-blue-200 flex items-center justify-center z-20">
                  <div className="text-blue-800 font-bold">Loading...</div>
                </div>
              )}

              {loadErrors.has(i) ? (
                <div className="w-full h-full bg-red-200 flex flex-col items-center justify-center text-red-800">
                  <div className="text-2xl mb-2">❌</div>
                  <div className="text-xs">Error {i + 1}</div>
                </div>
              ) : (
                <img
                  src={`/api/uploads/${foto}`}
                  alt={`${mobilName} - Foto ${i + 1}`}
                  onLoad={() => handleImageLoad(i)}
                  onError={() => handleImageError(i)}
                  onLoadStart={() => handleImageLoadStart(i)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    border: "none",
                    outline: "none",
                  }}
                />
              )}

              {/* Number badge */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded-full text-sm font-bold">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-center mt-3">
        <span className="text-sm text-gray-500">
          {fotos.length} foto tersedia -
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
