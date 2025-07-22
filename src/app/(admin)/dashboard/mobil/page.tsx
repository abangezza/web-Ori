import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import { MobilType } from "@/types/mobil";
import Table from "@/components/table";

export default async function Page() {
  await connectMongo();

  const mobilList: MobilType[] = await Mobil.find();

  return (
    <div className="p-4">
      <h1 className="text-5xl font-bold mb-4 text-center">List Seluruh Mobil</h1>
      <Table data={mobilList} />
    </div>
  );
}
