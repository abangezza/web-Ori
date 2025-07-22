// src/components/CarCarousel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CarAdComponent from './CarAdComponent';
import { MobilType } from '@/types/mobil';

interface CarCarouselProps {
  mobils: MobilType[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showFilter?: boolean;
  shuffle?: boolean; // Opsi untuk mengacak mobil
}

const CarCarousel: React.FC<CarCarouselProps> = ({ 
  mobils, 
  autoPlay = true, 
  autoPlayInterval = 6000,
  showFilter = false,
  shuffle = true // Default true untuk mengacak
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledMobils, setShuffledMobils] = useState<MobilType[]>([]);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle mobils pada mount atau ketika mobils berubah
  useEffect(() => {
    if (shuffle && mobils.length > 0) {
      setShuffledMobils(shuffleArray(mobils));
    } else {
      setShuffledMobils(mobils);
    }
    setCurrentIndex(0); // Reset index ketika data berubah
  }, [mobils, shuffle]);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || shuffledMobils.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === shuffledMobils.length - 1 ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, shuffledMobils.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? shuffledMobils.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === shuffledMobils.length - 1 ? 0 : prev + 1));
  };

  const handleShuffle = () => {
    setShuffledMobils(shuffleArray(shuffledMobils));
    setCurrentIndex(0);
  };

  if (mobils.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <div className="text-gray-500">Tidak ada mobil tersedia</div>
        </div>
      </div>
    );
  }

  if (shuffledMobils.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <div className="text-gray-500">Mengacak mobil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Carousel */}
      <CarAdComponent 
        mobil={shuffledMobils[currentIndex]} 
        onPrevious={handlePrevious}
        onNext={handleNext}
        showNavigation={shuffledMobils.length > 1}
        showFilter={showFilter}
      />
      
      {/* Control Buttons */}
      {shuffledMobils.length > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-4">
          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
            title="Acak urutan mobil"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            <span className="text-sm font-medium">Acak</span>
          </button>
        </div>
      )}
      
      {/* Indicators */}
      {shuffledMobils.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {shuffledMobils.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-orange-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Mobil ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Car Info */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">
          {currentIndex + 1} dari {shuffledMobils.length} mobil tersedia
          {shuffle && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
              🎲 Teracak
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCarousel;