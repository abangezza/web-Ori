// src/components/MobilImageAccordion.tsx - CLEAN VERSION
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

  const handleImageError = (index: number) => {
    console.error(`Image ${index + 1} failed to load:`, fotos[index]);
    setLoadErrors((prev) => new Set([...prev, index]));
    setLoadingStates((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageLoad = (index: number) => {
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

  const handleImageLoadStart = (index: number) => {
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
      {/* Main Accordion Display */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex gap-1 h-96">
          {fotos.map((foto, index) => (
            <div
              key={index}
              className="relative flex-1 min-w-0 cursor-pointer transition-all duration-500 hover:flex-[2] group"
              onClick={() => onImageClick?.(index)}
            >
              {/* Loading State */}
              {loadingStates.has(index) && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Error State */}
              {loadErrors.has(index) ? (
                <div className="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-600">
                  <div className="text-2xl mb-2">❌</div>
                  <div className="text-xs text-center px-2">
                    Gagal memuat foto {index + 1}
                  </div>
                </div>
              ) : (
                <img
                  src={`/api/uploads/${foto}`}
                  alt={`${mobilName} - Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  onLoadStart={() => handleImageLoadStart(index)}
                />
              )}

              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded-full text-sm font-bold transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                {index + 1}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    className="w-8 h-8"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="text-center mt-3">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span>{fotos.length} foto tersedia</span>
          <span>•</span>
          <span>Klik untuk melihat detail</span>
          {loadErrors.size > 0 && (
            <>
              <span>•</span>
              <span className="text-red-500">
                {loadErrors.size} foto gagal dimuat
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilImageAccordion;
