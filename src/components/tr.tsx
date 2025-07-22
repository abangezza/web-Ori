import Link from "next/link";
import { MobilType } from "@/types/mobil";

type TrProps = {
  data: MobilType;
  index: number;
};

function Tr({ data, index }: TrProps) {
  return (
    <tr className="border-b border-gray-300">
      <td className="py-2 px-3">{index + 1}</td>
      <td className="py-2 px-3 font-semibold text-base">{data.merek}</td>
      <td className="py-2 px-3 font-semibold text-base">{data.tipe}</td>
      <td className="py-2 px-3">{data.tahun}</td>
      <td className="py-2 px-3">{data.warna}</td>
      <td className="py-2 px-3">{data.noPol}</td>
      <td className="py-2 px-3">Rp. {Number(data.dp).toLocaleString("id-ID")}</td>
      <td className="py-2 px-3">
  <span
    className={`py-1 px-2 rounded text-white ${
      data.status === "tersedia"
        ? "bg-green-500"
        : data.status === "terjual"
        ? "bg-red-500"
        : "bg-gray-500"
    }`}
  >
    {data.status
      ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
      : "Tidak Diketahui"}
  </span>
</td>
      <td className="py-2 px-3">
        <Link href={`/dashboard/detailmobil/${data._id}`}>
          <button className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded cursor-pointer">
            Lihat Detail
          </button>
        </Link>
      </td>
    </tr>
  );
}

export default Tr;
