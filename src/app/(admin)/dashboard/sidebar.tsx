// Update src/app/(admin)/dashboard/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Mobil Tersedia", href: "/dashboard/mobil/tersedia" },
    { name: "Mobil Terjual", href: "/dashboard/mobil/terjual" },
    { name: "Seluruh Mobil", href: "/dashboard/mobil" },
    { name: "List Booking Test Drive", href: "/dashboard/booking-test-drive" },
    { name: "Manajemen Customer", href: "/dashboard/customers" }, // NEW
    { name: "Analytics & Reports", href: "/dashboard/analytics" }, // NEW
  ];

  return (
    <>
      <div className="fixed h-screen w-60 bg-orange-800 shadow-md p-5 flex flex-col">
        {/* Menu Items */}
        <nav className="flex flex-col space-y-2 mt-14">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-black font-semibold bg-orange-200"
                  : "text-white hover:text-black hover:bg-orange-200"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
