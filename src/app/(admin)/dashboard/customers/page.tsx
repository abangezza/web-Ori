// src/app/(admin)/dashboard/customers/page.tsx - UPDATED VERSION
import React from "react";
import EnhancedCustomerManagement from "@/components/EnhancedCustomerManagement";

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-8">
        {/* ✅ CHANGED: Using Enhanced Component instead of old CustomerManagement */}
        <EnhancedCustomerManagement />
      </div>
    </div>
  );
}
