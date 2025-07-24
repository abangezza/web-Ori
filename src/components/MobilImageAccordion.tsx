// src/components/MobilImageAccordion.tsx
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
            }}
          >
            <p style={{ color: "#6b7280" }}>Tidak ada foto tersedia</p>
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
      `}</style>

      <div className="accordion-container">
        {fotos.map((foto, i) => (
          <div
            key={i}
            className="accordion-item"
            onClick={() => onImageClick?.(i)}
          >
            <Image
              src={`/api/uploads/${foto}`}
              alt={`${mobilName} - Foto ${i + 1}`}
              fill
              className="object-cover"
              unoptimized
              onError={() =>
                console.error("Error loading image:", `/api/uploads/${foto}`)
              }
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
          </div>
        ))}
      </div>

      <div className="text-center mt-3">
        <span className="text-sm text-gray-500">
          {fotos.length} foto tersedia - Klik untuk memperbesar
        </span>
      </div>
    </div>
  );
};

export default MobilImageAccordion;
