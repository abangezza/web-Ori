import Tr from "./tr";
import Th from "./th";
import { MobilType } from "@/types/mobil"; // pastikan ada ini

type Props = {
  data: MobilType[];
};

function Table({ data }: Props) {
  return (
    <table className="table-auto w-full text-left">
      <thead>
        <Th/>
      </thead>
      <tbody>
        {data.map((mobil, idx) => (
          <Tr key={mobil._id} data={mobil} index={idx} />
        ))}
      </tbody>
    </table>
  );
}

export default Table;
