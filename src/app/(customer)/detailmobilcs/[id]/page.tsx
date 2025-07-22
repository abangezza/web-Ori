// src/app/(admin)/dashboard/detailmobil/[id]/page.tsx
import { MobilType } from "@/types/mobil";
import Mobil from "@/models/Mobil";
import connectMongo from "@/lib/conn";
import MobilDetailClient from "./MobilDetailClientcs";

type DetailProps = {
  params: { id: string };
};

export default async function MobilDetailPage({ params }: DetailProps) {
  await connectMongo();
  const mobil = await Mobil.findById(params.id).lean();

  if (!mobil) {
    return <div className="p-4 text-red-500">Mobil tidak ditemukan.</div>;
  }

  const data: MobilType = {
    ...mobil,
    _id: mobil._id.toString(),
  };

  return <MobilDetailClient data={data} />;
}