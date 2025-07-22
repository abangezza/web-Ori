// src/app/(admin)/booking-testdrive/page.tsx
import React from 'react';
import AdminTestDriveTable from '@/components/AdminTestDriveTable';

export default function BookingTestDrivePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-8">
        <AdminTestDriveTable />
      </div>
    </div>
  );
}