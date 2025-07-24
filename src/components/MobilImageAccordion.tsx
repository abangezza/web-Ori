// src/components/MobilImageAccordion.tsx - FIXED FOR VPS
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

  // Handle image load error
  const handleImageError = (index: number) => {
    console.error(`❌ Failed to load image ${index + 1}:`, fotos[index]);
    setLoadErrors((prev) => new Set([...prev, index]));
  };

  // Handle image load success
  const handleImageLoad = (index: number) => {
    console.log(`✅ Successfully loaded image ${index + 1}:`, fotos[index]);
    if (loadErrors.has(index)) {
      setLoadErrors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Get image URL with fallback
  const getImageUrl = (foto: string, index: number) => {
    // For VPS deployment, try multiple URL patterns
    const possibleUrls = [
      `/api/uploads/${foto}`, // Primary API route
      `/uploads/${foto}`, // Direct static file access
      `/public/uploads/${foto}`, // Alternative path
    ];

    return possibleUrls[0]; // Use primary URL, fallback handled in onError
  };

  if (!fotos || fotos.length === 0) {
    return (
      <div className="mb-6">
        <style jsx>{`
          .accordion-container {
            display: flex;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            min-height: 420px;
            background: white;
            padding: 0 8px 8px 8px;
            border-radius: 0 0 16px 16px;
            margin: 60px;
            margin-top: 120px;
          }
        `}</style>

        <div className="accordion-container">
          <div
            style={{
              width: "100%",
              height: "420px",
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
            <p style={{ color: "#6b7280", fontSize: "18px" }}>
              Tidak ada foto tersedia
            </p>
          </div>
        </div>

        <div className="text-center mt-3">
          <span className="text-sm text-gray-500">0 foto tersedia</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <style jsx>{`
        .accordion-container {
          display: flex;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          min-height: 420px;
          background: white;
          padding: 0 8px 8px 8px;
          border-radius: 0 0 16px 16px;
          margin: 60px;
          margin-top: 120px;
        }

        .accordion-item {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: flex 0.5s ease-in-out;
          flex: 0.5;
          margin: 0 4px;
          border-radius: 9px 9px 9px 9px;
          background: #f3f4f6;
        }

        .accordion-item:first-child {
          margin-left: 0;
        }

        .accordion-item:last-child {
          margin-right: 0;
        }

        .accordion-item:hover {
          flex: 2;
        }

        .accordion-image {
          width: 100%;
          height: 420px;
          object-fit: cover;
          transition: transform 0.5s ease;
          border-radius: 0 0 12px 12px;
        }

        .accordion-item:hover .accordion-image {
          transform: scale(1.1);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0);
          transition: background 0.3s ease;
        }

        .accordion-item:hover .image-overlay {
          background: rgba(0, 0, 0, 0.2);
        }

        .zoom-icon {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          padding: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .accordion-item:hover .zoom-icon {
          opacity: 1;
        }

        .zoom-icon:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .image-number {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
        }

        .error-placeholder {
          width: 100%;
          height: 420px;
          background: linear-gradient(
            45deg,
            #f3f4f6 25%,
            #e5e7eb 25%,
            #e5e7eb 50%,
            #f3f4f6 50%,
            #f3f4f6 75%,
            #e5e7eb 75%
          );
          background-size: 20px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 14px;
        }

        .retry-button {
          margin-top: 8px;
          padding: 4px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .retry-button:hover {
          background: #2563eb;
        }
      `}</style>

      <div className="accordion-container">
        {fotos.map((foto, i) => (
          <div
            key={`${foto}-${i}`} // More unique key
            className="accordion-item"
            onClick={() => onImageClick?.(i)}
          >
            {loadErrors.has(i) ? (
              // Error placeholder
              <div className="error-placeholder">
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📷</div>
                <div>Foto {i + 1}</div>
                <div
                  style={{
                    fontSize: "12px",
                    textAlign: "center",
                    marginTop: "4px",
                  }}
                >
                  Gagal memuat gambar
                </div>
                <button
                  className="retry-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageError(i); // Reset error state
                    setLoadErrors((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(i);
                      return newSet;
                    });
                  }}
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                <Image
                  src={getImageUrl(foto, i)}
                  alt={`${mobilName} - Foto ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={true} // Important for VPS deployment
                  onError={() => handleImageError(i)}
                  onLoad={() => handleImageLoad(i)}
                  priority={i < 3} // Prioritize first 3 images
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                <div className="image-overlay" />

                <div className="zoom-icon">
                  <svg
                    className="w-5 h-5 text-gray-700"
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

                <div className="image-number">{i + 1}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-3">
        <span className="text-sm text-gray-500">
          {fotos.length} foto tersedia - Klik untuk memperbesar
        </span>
        {loadErrors.size > 0 && (
          <div className="text-xs text-orange-600 mt-1">
            {loadErrors.size} foto gagal dimuat
          </div>
        )}
      </div>

      {/* Debug info - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-center mt-2">
          <details className="text-xs text-gray-400">
            <summary>Debug Info</summary>
            <div className="mt-2 text-left bg-gray-100 p-2 rounded text-xs">
              <div>Total photos: {fotos.length}</div>
              <div>Load errors: {loadErrors.size}</div>
              <div>
                Sample URL: {fotos[0] ? getImageUrl(fotos[0], 0) : "N/A"}
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default MobilImageAccordion;
