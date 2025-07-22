// /src/app/(customer)/mobil/[[..slug]]/page.tsx
import React from "react";
import Link from "next/link";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import MobilCard from "@/components/MobilCard";
import MobilSearchFilter from "@/components/MobilSearchFilter";
import MobilPagination from "@/components/MobilPagination";
import { MobilType } from "@/types/mobil";

type PageProps = {
  params: {
    slug?: string[];
  };
  searchParams: {
    page?: string;
  };
};

export default async function Page({ params, searchParams }: PageProps) {
  await connectMongo();
  
  const slug = params.slug || [];
  const currentPage = parseInt(searchParams.page || '1');
  const itemsPerPage = 8;
  
  let allMobils: MobilType[] = [];
  let pageTitle = "Semua Mobil";
  let filterInfo = "";
  let showSearchFilter = true;
  let initialFilters: any = {};

  try {
    // Kondisi jika slug kosong → tampilkan semua mobil
    if (slug.length === 0) {
      const data = await Mobil.find().lean();
      allMobils = data.map((mobil: any) => ({
        ...mobil,
        _id: mobil._id.toString(),
      }));
      pageTitle = "Semua Mobil";
    }

    // Jika slug hanya 1 → filter berdasarkan status atau detail ID
    else if (slug.length === 1) {
      const filter = slug[0].toLowerCase();
      const statusList = ["tersedia", "terjual"];

      if (statusList.includes(filter)) {
        // Filter berdasarkan status
        const data = await Mobil.find({ status: filter }).lean();
        allMobils = data.map((mobil: any) => ({
          ...mobil,
          _id: mobil._id.toString(),
        }));
        pageTitle = `Mobil ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
        filterInfo = `Menampilkan mobil dengan status: ${filter}`;
      } else {
        // Coba cari berdasarkan ID untuk detail mobil
        try {
          const data = await Mobil.findById(filter).lean();
          if (data) {
            showSearchFilter = false;
            allMobils = [{
              ...data,
              _id: data._id.toString(),
            }];
            pageTitle = `${data.merek} ${data.tipe}`;
          } else {
            // Jika ID tidak ditemukan
            pageTitle = "Mobil Tidak Ditemukan";
            filterInfo = `ID "${filter}" tidak ditemukan`;
          }
        } catch (idError) {
          // Jika format ID tidak valid
          pageTitle = "Mobil Tidak Ditemukan";
          filterInfo = `Format ID "${filter}" tidak valid`;
        }
      }
    }

    // Jika slug terdiri dari 3 item → filter berdasarkan merek, transmisi, tahun
    else if (slug.length === 3) {
      const [merek, transmisi, tahun] = slug;
      
      // Set initial filters for the search component
      initialFilters = {
        merek: merek !== 'all' ? merek : 'all',
        transmisi: transmisi !== 'all' ? transmisi : 'all',
        tahun: tahun !== 'all' ? tahun : 'all'
      };
      
      const query: any = {};
      
      // Build query object
      if (merek && merek !== 'all') {
        query.merek = new RegExp(merek.replace(/\+/g, ' '), 'i'); // Handle URL encoding
      }
      if (transmisi && transmisi !== 'all') {
        query.transmisi = new RegExp(transmisi, 'i');
      }
      if (tahun && tahun !== 'all' && !isNaN(parseInt(tahun))) {
        query.tahun = parseInt(tahun);
      }

      const data = await Mobil.find(query).lean();
      allMobils = data.map((mobil: any) => ({
        ...mobil,
        _id: mobil._id.toString(),
      }));
      
      pageTitle = "Hasil Pencarian Mobil";
      const filters = [];
      if (merek !== 'all') filters.push(`Merek: ${merek.replace(/\+/g, ' ')}`);
      if (transmisi !== 'all') filters.push(`Transmisi: ${transmisi}`);
      if (tahun !== 'all') filters.push(`Tahun: ${tahun}`);
      filterInfo = filters.length > 0 ? `Filter: ${filters.join(' | ')}` : '';
    }

    // Jika struktur slug tidak sesuai
    else {
      pageTitle = "Format URL Tidak Valid";
      showSearchFilter = false;
    }

    // ✨ FITUR BARU: Sort berdasarkan status (tersedia dulu, baru terjual)
    // Hanya sort jika bukan pencarian berdasarkan status spesifik
    if (slug.length !== 1 || !["tersedia", "terjual"].includes(slug[0].toLowerCase())) {
      allMobils.sort((a, b) => {
        // Status 'tersedia' akan memiliki prioritas lebih tinggi
        if (a.status === 'tersedia' && b.status === 'terjual') return -1;
        if (a.status === 'terjual' && b.status === 'tersedia') return 1;
        
        // Jika status sama, sort berdasarkan tahun terbaru
        return parseInt(b.tahun) - parseInt(a.tahun);
      });
    }

  } catch (error) {
    console.error("Error fetching mobil data:", error);
    allMobils = [];
    pageTitle = "Terjadi Kesalahan";
  }

  // Pagination logic
  const totalItems = allMobils.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMobils = allMobils.slice(startIndex, endIndex);

  // Count untuk informasi tambahan
  const tersediaCount = allMobils.filter(mobil => mobil.status === 'tersedia').length;
  const terjualCount = allMobils.filter(mobil => mobil.status === 'terjual').length;

  // Build current URL for pagination
  const getBaseUrl = () => {
    if (slug.length === 0) return '/mobil';
    if (slug.length === 1) return `/mobil/${slug[0]}`;
    if (slug.length === 3) return `/mobil/${slug.join('/')}`;
    return '/mobil';
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Selalu di tengah */}
        <div className="text-center mb-8 pt-20">
          <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
          {filterInfo && (
            <p className="text-sm text-blue-600 mb-2">{filterInfo}</p>
          )}
          <div className="text-sm text-gray-500 mt-2">
            <p>
              Ditemukan {totalItems} mobil
              {/* Tampilkan breakdown status jika ada pencarian/filter */}
              {(slug.length > 0 && !["tersedia", "terjual"].includes(slug[0]?.toLowerCase() || '')) && totalItems > 0 && (
                <span className="ml-2">
                  ({tersediaCount} tersedia, {terjualCount} terjual)
                </span>
              )}
              {totalPages > 1 && (
                <span className="ml-2">
                  - Halaman {currentPage} dari {totalPages}
                </span>
              )}
            </p>
            {/* Info prioritas status */}
            {(slug.length === 0 || slug.length === 3) && totalItems > 0 && tersediaCount > 0 && terjualCount > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Mobil tersedia ditampilkan terlebih dahulu
              </p>
            )}
          </div>
        </div>

        {/* Search Filter Component - Selalu di tengah */}
        {showSearchFilter && (
          <div className="flex justify-center mb-8">
            <MobilSearchFilter initialFilters={initialFilters} />
          </div>
        )}

        {/* Grid Cards - Terpusat dengan ukuran max tetap */}
        {currentMobils.length > 0 ? (
          <>
            <div className="flex justify-center mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
                {currentMobils.map((mobil) => (
                  <MobilCard key={mobil._id} mobil={mobil} />
                ))}
              </div>
            </div>

            {/* Pagination - Only show if more than 8 items */}
            {totalItems > itemsPerPage && (
              <div className="flex justify-center mt-12">
                <MobilPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={getBaseUrl()}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center">
            <div className="text-center py-12 max-w-md">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {pageTitle.includes("Tidak Ditemukan") || pageTitle.includes("Kesalahan") || pageTitle.includes("Tidak Valid") 
                  ? pageTitle 
                  : "Tidak ada mobil yang ditemukan"
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {pageTitle.includes("Tidak Ditemukan") || pageTitle.includes("Kesalahan") || pageTitle.includes("Tidak Valid")
                  ? "Periksa kembali URL atau coba navigasi dari menu utama"
                  : "Coba ubah filter pencarian atau kembali ke halaman utama untuk melihat semua mobil"
                }
              </p>
              <div className="space-y-3">
                <Link 
                  href="/mobil" 
                  className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Lihat Semua Mobil
                </Link>
                {showSearchFilter && (
                  <>
                    <br />
                    <Link 
                      href="/mobil/tersedia" 
                      className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      Mobil Tersedia
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}