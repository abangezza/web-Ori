// types/testdrivebooking.ts

import { MobilType } from "./mobil";

export type TestDriveBookingType = {
  _id?: string;
  namaCustomer: string;
  noHp: string;
  mobilId: string | MobilType; // bisa ID (saat submit), bisa object (setelah populate)
  tanggalTest: string; // format ISO string (YYYY-MM-DD)
};
