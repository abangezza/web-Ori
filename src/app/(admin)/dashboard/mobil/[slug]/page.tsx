// app/(admin)/dashboard/mobil/[slug]/page.tsx
import React from "react";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import { MobilType } from "@/types/mobil";
import DashboardTableWithPagination from "@/components/DashboardTableWithPagination";

type PageProps = {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
};

export default async function Page({ params, searchParams }: PageProps) {
  await connectMongo();

  const { slug } = params;
  const currentPage = parseInt(searchParams.page || '1');
  const itemsPerPage = 15;
  const skip = (currentPage - 1) * itemsPerPage;

  let filter = {};
  let pageTitle = "List Seluruh Mobil";

  // Set filter berdasarkan slug
  if (slug === "tersedia" || slug === "terjual") {
    filter = { status: slug };
    pageTitle = slug === "tersedia" 
      ? "List Mobil Tersedia" 
      : "List Mobil Terjual";
  }

  // Get total count untuk pagination
  const totalItems = await Mobil.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch data dengan pagination dan filter
  const mobilData = await Mobil.find(filter)
    .skip(skip)
    .limit(itemsPerPage)
    .lean();

  // Convert ke MobilType format
  const mobilList: MobilType[] = mobilData.map((mobil: any) => ({
    _id: mobil._id.toString(),
    merek: mobil.merek || "",
    tipe: mobil.tipe || "",
    tahun: mobil.tahun?.toString() || "",
    warna: mobil.warna || "",
    noPol: mobil.noPol || "",
    noRangka: mobil.noRangka || "",
    noMesin: mobil.noMesin || "",
    kapasitas_mesin: mobil.kapasitas_mesin || 0,
    bahan_bakar: mobil.bahan_bakar || "",
    transmisi: mobil.transmisi || "",
    kilometer: mobil.kilometer || 0,
    harga: mobil.harga || 0,
    dp: mobil.dp || 0,
    angsuran_4_thn: mobil.angsuran_4_thn || 0,
    angsuran_5_tahun: mobil.angsuran_5_tahun || 0,
    pajak: mobil.pajak || "",
    STNK: mobil.STNK || "",
    BPKB: mobil.BPKB || "",
    Faktur: mobil.Faktur || "",
    deskripsi: mobil.deskripsi || "",
    status: mobil.status || "",
    fotos: mobil.fotos || [],
  }));

  return (
    <div className="p-4">
      <h1 className="text-5xl font-bold mb-4 text-center">
        {pageTitle}
      </h1>
      <DashboardTableWithPagination 
        data={mobilList}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        baseUrl={`/dashboard/mobil/${slug}`}
        showStatusInfo={true}
        statusFilter={slug === "tersedia" || slug === "terjual" ? slug : undefined}
      />
    </div>
  );
}