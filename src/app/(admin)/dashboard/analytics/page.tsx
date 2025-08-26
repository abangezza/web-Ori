// src/app/(admin)/dashboard/analytics/page.tsx - UPDATED VERSION
import React from "react";
import EnhancedAnalyticsDashboard from "@/components/EnhancedAnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-8">
        {/* ✅ CHANGED: Using Enhanced Analytics Dashboard */}
        <EnhancedAnalyticsDashboard />
      </div>
    </div>
  );
}
