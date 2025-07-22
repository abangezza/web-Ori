// src/app/(admin)/dashboard/analytics/page.tsx
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
