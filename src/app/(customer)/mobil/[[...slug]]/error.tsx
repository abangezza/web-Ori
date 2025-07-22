'use client'; // Wajib untuk error boundary di Next.js App Router

import { useEffect } from 'react';

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Error caught by error.tsx:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h1>
        <p className="text-gray-700 mb-6"> Maaf, sesuatu yang salah terjadi.</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
