// src/app/page.tsx
import React from 'react';
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import CarCarousel from '@/components/CarCarousel';
import { MobilType } from "@/types/mobil";
import AvailableCarsSection from '@/components/AvailableCarsSection';
import MobileWelcomeSection from '@/components/MobileWelcomeSection';

export default async function Home() {
  // Fetch mobil data dari MongoDB
  let featuredMobils: MobilType[] = [];
  
  try {
    await connectMongo();
    
    // Ambil SEMUA mobil dengan status tersedia
    const data = await Mobil.find({ status: 'tersedia' })
      .sort({ createdAt: -1 }) // Urutkan berdasarkan yang terbaru
      .lean();
    
    featuredMobils = data.map((mobil: any) => ({
      ...mobil,
      _id: mobil._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching mobil data:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section>
        {/* Desktop: Featured Cars Carousel dengan Filter */}
        {featuredMobils.length > 0 && (
          <div className="hidden md:block">
            <CarCarousel 
              mobils={featuredMobils} 
              showFilter={true}
              autoPlay={true}
              autoPlayInterval={5000}
            />
          </div>
        )}

        {/* Mobile: Welcome Section */}
        <div className="md:hidden">
          <MobileWelcomeSection mobilCount={featuredMobils.length} />
        </div>
      </section>

      {/* Available Cars Section */}
      <section id="available-cars" className="min-h-screen bg-gray-50 pt-7 pb-12">
        <AvailableCarsSection 
          title="Mobil Tersedia"
          showTitle={true}
          itemsPerPage={8}
        />
      </section>
    </main>
  );
}