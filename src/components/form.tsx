import TambahMobil from "@/components/tambahMobil";
import UpdateMobil from "./updateMobil";

export default function Form() {
    const flag = true;
    return (
        <div>
            <div className="container mx-auto">
                {flag ? <TambahMobil /> : <UpdateMobil />}
            </div>
        </div>
    );
}