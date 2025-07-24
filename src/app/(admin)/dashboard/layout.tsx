"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SessionProvider>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="lg:ml-60">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="max-w-full">{children}</div>
          </main>
        </div>
      </SessionProvider>
    </div>
  );
}
