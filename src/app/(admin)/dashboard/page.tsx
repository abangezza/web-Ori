// app/(admin)/dashboard/page.tsx
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import Toggle from "./toggle";
import DashboardTableWithPagination from "@/components/DashboardTableWithPagination";

type PageProps = {
  searchParams: {
    page?: string;
  };
};

export default async function DashboardPage({ searchParams }: PageProps) {
  await connectMongo();

  const currentPage = parseInt(searchParams.page || '1');
  const itemsPerPage = 15;
  const skip = (currentPage - 1) * itemsPerPage;

  // Get total count untuk pagination
  const totalItems = await Mobil.countDocuments();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch data dengan pagination
  const mobilData = await Mobil.find()
    .skip(skip)
    .limit(itemsPerPage)
    .lean();

  // Format _id dan pastikan semua field ada
  const formattedMobil = mobilData.map((mobil: any) => ({
    _id: mobil._id.toString(),
    merek: mobil.merek || "",
    tipe: mobil.tipe || "",
    tahun: mobil.tahun?.toString() || "",
    warna: mobil.warna || "",
    noPol: mobil.noPol || "",
    dp: mobil.dp || 0,
    status: mobil.status || "",
  }));

  return (
    <div className="">
      <Toggle />
      <DashboardTableWithPagination 
        data={formattedMobil}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        baseUrl="/dashboard"
      />
    </div>
  );
}