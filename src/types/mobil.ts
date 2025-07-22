export type MobilType = {
  _id: string;
  merek: string;
  tipe: string;
  tahun: string;
  warna: string;
  noPol: string;
  dp: number;
  status: string;
  transmisi: string,
  noRangka: string,
  noMesin: string,
  kapasitas_mesin: number,
  bahan_bakar: string,
  pajak: string,
  kilometer: number,
  fotos: [string],
  angsuran_4_thn: number,
  angsuran_5_tahun: number,
  STNK: string,
  BPKB: string,
  Faktur: string,
  harga: number,
  deskripsi: string,
  // dan properti lain sesuai schema abang
};
