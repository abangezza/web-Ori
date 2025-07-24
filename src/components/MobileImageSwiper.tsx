// src/components/MobileImageSwiper.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";

interface MobileImageSwiperProps {
  fotos: string[];
  mobilName: string;
  onImageClick?: (imageIndex: number) => void;
}

const MobileImageSwiper: React.FC<MobileImageSwiperProps> = ({
  fotos,
  mobilName,
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!fotos || fotos.length === 0) {
    return (
      <div className="mb-6">
        <div className="bg-gray-100 rounded-lg p-8 text-center h-80">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-600">Tidak ada foto tersedia</p>
        </div>
      </div>
    );
  }

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(distance) < threshold) return;

    if (distance > 0) {
      // Swiped left - go to next
      goToNext();
    } else {
      // Swiped right - go to previous
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <h4 className="font-bold mb-2 text-center text-sm">
          🎯 Swipe gambar untuk melihat foto lainnya
        </h4>

        {/* Main Image Container */}
        <div
          ref={containerRef}
          className="relative h-80 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => onImageClick?.(currentIndex)}
        >
          {/* Current Image */}
          <div
            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
              isAnimating ? "scale-105" : "scale-100"
            }`}
          >
            <img
              src={`/api/uploads/${fotos[currentIndex]}`}
              alt={`${mobilName} - Foto ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Image Counter Overlay */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {fotos.length}
            </div>

            {/* Swipe Hint Animation */}
            {fotos.length > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-black bg-opacity-60 text-white px-3 py-2 rounded-full text-xs animate-pulse">
                <span>Swipe</span>
                <svg
                  className="w-4 h-4 animate-bounce"
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
              </div>
            )}
          </div>

          {/* Navigation Arrows (for non-touch devices) */}
          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
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
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {fotos.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {fotos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsAnimating(false), 300);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentIndex === index
                    ? "bg-green-600 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <span className="text-sm text-gray-500">
          {fotos.length} foto tersedia • Tap untuk fullscreen
        </span>
      </div>
    </div>
  );
};

export default MobileImageSwiper;
