// src/app/(admin)/dashboard/customers/page.tsx
import CustomerManagement from "@/components/CustomerManagement";

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-8">
        <CustomerManagement />
      </div>
    </div>
  );
}
