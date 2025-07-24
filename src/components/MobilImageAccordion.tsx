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

      {/* ✅ SOLUTION 2: Fixed Height with Visible Borders */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <h4 className="font-bold mb-2">
          🎯 Solution 2: Fixed Height + Borders
        </h4>
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

      {/* ✅ SOLUTION 3: Grid Layout Alternative */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <h4 className="font-bold mb-2">🎯 Solution 3: Grid Layout</h4>
        <div
          className="grid gap-2 rounded-lg overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${Math.min(fotos.length, 5)}, 1fr)`,
            height: "300px",
            border: "3px solid #10b981",
            backgroundColor: "#ecfdf5",
          }}
        >
          {fotos.map((foto, i) => (
            <div
              key={`grid-${i}`}
              className="relative cursor-pointer overflow-hidden rounded-lg hover:scale-105 transition-transform duration-200"
              onClick={() => onImageClick?.(i)}
              style={{
                border: "2px solid #059669",
                backgroundColor: "#d1fae5",
              }}
            >
              <img
                src={`/api/uploads/${foto}`}
                alt={`${mobilName} - Foto ${i + 1}`}
                onLoad={() => console.log(`Grid image ${i + 1} loaded`)}
                onError={() => console.log(`Grid image ${i + 1} error`)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div className="absolute bottom-1 right-1 bg-green-600 text-white px-1 py-0.5 rounded text-xs">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ SOLUTION 4: Debug with Visible Background */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h4 className="font-bold mb-2">🎯 Solution 4: Debug Version</h4>
        <div className="space-y-2">
          {fotos.map((foto, i) => (
            <div
              key={`debug-${i}`}
              className="border-2 border-purple-500 p-2 rounded-lg"
            >
              <div className="text-sm font-semibold mb-1">Image {i + 1}:</div>
              <div className="flex gap-4 items-center">
                <div
                  className="w-32 h-32 border-2 border-dashed border-gray-400 rounded cursor-pointer"
                  onClick={() => onImageClick?.(i)}
                  style={{ backgroundColor: "#f9fafb" }}
                >
                  <img
                    src={`/api/uploads/${foto}`}
                    alt={`Debug ${i + 1}`}
                    className="w-full h-full object-cover rounded"
                    onLoad={() =>
                      console.log(`Debug image ${i + 1} loaded successfully`)
                    }
                    onError={() =>
                      console.log(`Debug image ${i + 1} failed to load`)
                    }
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-mono break-all">
                    /api/uploads/{foto}
                  </div>
                  <div className="text-xs mt-1">
                    Status:{" "}
                    {loadErrors.has(i)
                      ? "❌ Error"
                      : loadingStates.has(i)
                      ? "🔄 Loading"
                      : "✅ Loaded"}
                  </div>
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
