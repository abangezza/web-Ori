// src/components/ApiTestComponent.tsx - untuk testing di development
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface TestResult {
  url: string;
  status: "loading" | "success" | "error";
  error?: string;
  loadTime?: number;
}

const ApiTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [sampleImages, setSampleImages] = useState<string[]>([]);

  // Get sample images from a test mobil
  useEffect(() => {
    fetchSampleImages();
  }, []);

  const fetchSampleImages = async () => {
    try {
      const response = await fetch("/api/mobil");
      const result = await response.json();

      if (result.success) {
        // Get first mobil with photos
        const mobilWithPhotos = result.data?.find(
          (mobil: any) => mobil.fotos?.length > 0
        );
        if (mobilWithPhotos?.fotos) {
          setSampleImages(mobilWithPhotos.fotos.slice(0, 3)); // Test first 3 images
        }
      }
    } catch (error) {
      console.error("Failed to fetch sample images:", error);
    }
  };

  const testImageUrls = (images: string[]) => {
    const results: TestResult[] = images.map((image) => ({
      url: `/api/uploads/${image}`,
      status: "loading" as const,
    }));

    setTestResults(results);

    // Test each URL
    images.forEach(async (image, index) => {
      const startTime = Date.now();
      const testUrl = `/api/uploads/${image}`;

      try {
        const response = await fetch(testUrl, { method: "HEAD" });
        const loadTime = Date.now() - startTime;

        setTestResults((prev) =>
          prev.map((result, i) =>
            i === index
              ? {
                  ...result,
                  status: response.ok ? "success" : "error",
                  loadTime,
                  error: response.ok ? undefined : `HTTP ${response.status}`,
                }
              : result
          )
        );
      } catch (error) {
        const loadTime = Date.now() - startTime;
        setTestResults((prev) =>
          prev.map((result, i) =>
            i === index
              ? {
                  ...result,
                  status: "error",
                  loadTime,
                  error:
                    error instanceof Error ? error.message : "Network error",
                }
              : result
          )
        );
      }
    });
  };

  const testApiHealth = async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      console.log("API Health:", data);
      alert(`API Health: ${response.ok ? "OK" : "Error"}`);
    } catch (error) {
      console.error("API Health check failed:", error);
      alert("API Health check failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🔧 API Image Test Component</h2>

      {/* Controls */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => testImageUrls(sampleImages)}
          disabled={sampleImages.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Test Image URLs ({sampleImages.length} images)
        </button>

        <button
          onClick={testApiHealth}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test API Health
        </button>

        <button
          onClick={fetchSampleImages}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Refresh Sample Images
        </button>
      </div>

      {/* Sample Images Info */}
      {sampleImages.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Sample Images Found:</h3>
          <ul className="text-sm text-gray-600">
            {sampleImages.map((image, index) => (
              <li key={index} className="truncate">
                {index + 1}. {image}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results:</h3>

          {testResults.map((result, index) => (
            <div key={index} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm truncate flex-1 mr-4">
                  {result.url}
                </span>
                <div className="flex items-center gap-2">
                  {result.status === "loading" && (
                    <span className="text-blue-500">🔄 Testing...</span>
                  )}
                  {result.status === "success" && (
                    <span className="text-green-500">✅ Success</span>
                  )}
                  {result.status === "error" && (
                    <span className="text-red-500">❌ Error</span>
                  )}
                  {result.loadTime && (
                    <span className="text-gray-500 text-xs">
                      ({result.loadTime}ms)
                    </span>
                  )}
                </div>
              </div>

              {result.error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  Error: {result.error}
                </div>
              )}

              {result.status === "success" && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <div className="relative w-32 h-24 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={result.url}
                      alt={`Test image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error(`Image load error for ${result.url}:`, e);
                      }}
                      onLoad={() => {
                        console.log(`Image loaded successfully: ${result.url}`);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <div className="space-y-1 font-mono">
          <div>
            Current URL:{" "}
            {typeof window !== "undefined" ? window.location.origin : "SSR"}
          </div>
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>Timestamp: {new Date().toISOString()}</div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestComponent;
