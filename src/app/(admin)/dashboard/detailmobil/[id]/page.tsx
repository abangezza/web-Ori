// src/app/(admin)/dashboard/detailmobil/[id]/page.tsx
import { MobilType } from "@/types/mobil";
import Mobil from "@/models/Mobil";
import connectMongo from "@/lib/conn";
import MobilDetailClientWrapper from "./MobilDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

type DetailProps = {
  params: { id: string };
};

export default async function MobilDetailPage({ params }: DetailProps) {
  // Get session untuk role checking
  const session = await getServerSession(authOptions);

  // Redirect jika tidak ada session
  if (!session) {
    redirect('/login');
  }

  await connectMongo();
  const mobil = await Mobil.findById(params.id).lean();

  if (!mobil) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Mobil Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">ID mobil yang Anda cari tidak ada dalam database.</p>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Kembali ke Dashboard
        </a>
      </div>
    );
  }

  const data: MobilType = {
    ...mobil,
    _id: mobil._id.toString(),
  };

  return (
    <MobilDetailClientWrapper 
      data={data} 
      userRole={session.user.role}
      userName={session.user.name}
    />
  );
}