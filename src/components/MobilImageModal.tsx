// src/components/MobilImageModal.tsx
"use client";

import React, { useEffect } from "react";
import Image from "next/image";

interface MobilImageModalProps {
  isOpen: boolean;
  fotos: string[];
  currentImageIndex: number;
  mobilName: string;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onImageSelect: (index: number) => void;
}

const MobilImageModal: React.FC<MobilImageModalProps> = ({
  isOpen,
  fotos,
  currentImageIndex,
  mobilName,
  onClose,
  onNext,
  onPrevious,
  onImageSelect,
}) => {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrevious, onClose]);

  if (!isOpen || !fotos || fotos.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 transition-all duration-200 shadow-lg border-2 border-gray-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
        >
          ← Kembali
        </button>

        {/* Previous Button */}
        {fotos.length > 1 && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {fotos.length > 1 && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-3 transition-all duration-200 shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Main Image */}
        <div className="relative max-w-full max-h-full">
          <Image
            src={`/api/uploads/${fotos[currentImageIndex]}`}
            alt={`${mobilName} - Foto ${currentImageIndex + 1}`}
            width={1500}
            height={1200}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: "calc(100vh - 120px)" }}
            unoptimized
          />
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
          {currentImageIndex + 1} / {fotos.length}
        </div>

        {/* Thumbnail Navigation */}
        {fotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80%] overflow-x-auto scrollbar-hide">
            {fotos.map((foto, i) => (
              <button
                key={i}
                onClick={() => onImageSelect(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  currentImageIndex === i
                    ? "border-white shadow-lg"
                    : "border-white border-opacity-50 hover:border-opacity-75"
                }`}
              >
                <Image
                  src={`/api/uploads/${foto}`}
                  alt={`Thumbnail ${i + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {/* Keyboard Hints */}
        {fotos.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-xs">
            ← → untuk navigasi • ESC untuk tutup
          </div>
        )}
      </div>

      {/* Background Overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default MobilImageModal;
