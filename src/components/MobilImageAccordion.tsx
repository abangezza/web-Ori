// src/components/MobilImageAccordion.tsx - FIXED VERSION
"use client";

import React, { useState } from "react";
import Image from "next/image";

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
  const [debugMode, setDebugMode] = useState(false);

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
    console.log(`✅ Image ${index + 1} loaded:`, fotos[index]);
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
    setLoadingStates((prev) => new Set([...prev, index]));
  };

  // Test image URL function
  const testImageUrl = async (foto: string, index: number) => {
    const url = `/api/uploads/${foto}`;
    console.log(`🔍 Testing URL ${index + 1}:`, url);

    try {
      const response = await fetch(url, { method: "HEAD" });
      console.log(`📊 Response ${index + 1}:`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });
      return response.ok;
    } catch (error) {
      console.error(`❌ Network error ${index + 1}:`, error);
      return false;
    }
  };

  // ✅ FIXED: Alternative image rendering using regular img tag for accordion
  const renderAccordionImage = (foto: string, index: number) => {
    const imageUrl = `/api/uploads/${foto}`;

    return (
      <img
        src={imageUrl}
        alt={`${mobilName} - Foto ${index + 1}`}
        className="w-full h-96 object-cover transition-transform duration-500 hover:scale-110"
        onLoad={() => handleImageLoad(index)}
        onError={() => handleImageError(index)}
        onLoadStart={() => handleImageLoadStart(index)}
        style={{
          backgroundColor: loadingStates.has(index) ? "#f3f4f6" : "transparent",
        }}
      />
    );
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
          <h3 className="font-bold mb-2">🐛 Debug Information</h3>
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
              {fotos.slice(0, 3).map((foto, i) => (
                <li key={i} className="font-mono text-xs">
                  {i + 1}. /api/uploads/{foto}
                  <button
                    onClick={() => testImageUrl(foto, i)}
                    className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    Test
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Accordion Container */}
      <div
        className="flex overflow-hidden shadow-lg min-h-96 bg-white p-2 rounded-lg"
        style={{
          marginTop: "20px",
          marginLeft: "20px",
          marginRight: "20px",
        }}
      >
        {fotos.map((foto, i) => (
          <div
            key={`${foto}-${i}`}
            className={`relative overflow-hidden cursor-pointer transition-all duration-500 mx-1 rounded-lg ${
              fotos.length === 1 ? "flex-1" : "flex-1 hover:flex-[2]"
            }`}
            onClick={() => onImageClick?.(i)}
            style={{ minWidth: "60px" }}
          >
            {loadErrors.has(i) ? (
              // Error State
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center text-gray-600">
                <div className="text-4xl mb-2">⚠️</div>
                <div className="text-sm font-medium">Foto {i + 1}</div>
                <div className="text-xs mt-1">Gagal dimuat</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLoadErrors((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(i);
                      return newSet;
                    });
                  }}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  Retry
                </button>
                {debugMode && (
                  <div className="mt-2 text-xs break-all px-2">{foto}</div>
                )}
              </div>
            ) : (
              <>
                {/* ✅ FIXED: Use regular img tag instead of Next.js Image for accordion */}
                <div className="relative w-full h-96">
                  {loadingStates.has(i) && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  )}
                  {renderAccordionImage(foto, i)}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300" />

                {/* Zoom Icon */}
                <div className="absolute top-3 right-3 bg-white bg-opacity-80 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>

                {/* Photo Number */}
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-sm font-medium">
                  {i + 1}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="text-center mt-3">
        <span className="text-sm text-gray-500">
          {fotos.length} foto tersedia
          {loadErrors.size > 0 && (
            <span className="text-red-500 ml-2">({loadErrors.size} error)</span>
          )}
          {loadingStates.size > 0 && (
            <span className="text-blue-500 ml-2">
              ({loadingStates.size} loading)
            </span>
          )}
        </span>
      </div>

      {/* ✅ ADDITIONAL: Test All Images Button */}
      {debugMode && (
        <div className="text-center mt-4">
          <button
            onClick={async () => {
              console.log("🔍 Testing all image URLs...");
              for (let i = 0; i < fotos.length; i++) {
                await testImageUrl(fotos[i], i);
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Test All Images
          </button>
        </div>
      )}
    </div>
  );
};

export default MobilImageAccordion;
