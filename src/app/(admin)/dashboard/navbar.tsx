
// 5. /src/components/Navbar.tsx (logout tombol)
'use client';

import { signOut } from 'next-auth/react';

export default function Navbar() {
  return (
<nav className="bg-white shadow-sm sticky top-0 z-50">
  <div className="mx-auto max-w-9xl px-2 sm:px-6 lg:px-8">
    <div className="relative flex h-16 items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="font-bold text-gray-800 text-3xl">Radja Auto Car</span>
      </div>
      
      
      <div className="ml-auto">
        <button
          className="bg-red-600 text-white px-4 py-2 mr-4 rounded hover:bg-blue-600 transition cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          LOGOUT
        </button>
      </div>
    </div>
  </div>
</nav>


  );
}
