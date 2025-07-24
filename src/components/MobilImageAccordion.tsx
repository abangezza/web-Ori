// src/components/MobilImageAccordion.tsx - CSS DEBUG VERSION
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
  const [debugMode, setDebugMode] = useState(true); // Default true untuk debug

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
      {/* Debug Toggle */}
      <div className="mb-4 text-center">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          {debugMode ? "🐛 Hide Debug" : "🔍 Show Debug"}
        </button>
      </div>

      {/* Debug Panel */}
      {debugMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold mb-2">🐛 CSS Debug Information</h3>
          <div className="text-sm space-y-2">
            <div>
              <strong>Total photos:</strong> {fotos.length}
            </div>
            <div>
              <strong>Load errors:</strong> {loadErrors.size}
            </div>
            <div>
              <strong>Loading states:</strong> {loadingStates.size}
            </div>
            <div>
              <strong>Sample URLs:</strong>
            </div>
            <ul className="ml-4 space-y-1">
              {fotos.slice(0, 2).map((foto, i) => (
                <li key={i} className="font-mono text-xs break-all">
                  {i + 1}. /api/uploads/{foto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ✅ SOLUTION 1: Simplified CSS Accordion */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <h4 className="font-bold mb-2">🎯 Solution 1: Simplified Layout</h4>
        <div className="flex gap-2 h-96 overflow-hidden">
          {fotos.map((foto, i) => (
            <div
              key={`simple-${i}`}
              className="flex-1 min-w-0 cursor-pointer rounded-lg overflow-hidden hover:flex-[2] transition-all duration-300"
              onClick={() => onImageClick?.(i)}
              style={{
                backgroundColor: "#f3f4f6", // Light gray background
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
              <div className="relative">
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {i + 1}
                </div>
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
