import mongoose, { Schema, model, models } from 'mongoose';

const MobilSchema = new Schema({
  merek: String,
  tipe: String,
  tahun: Number,
  transmisi: String,
  warna: String,
  noPol: String,
  noRangka: String,
  noMesin: String,
  kapasitas_mesin: Number,
  bahan_bakar: String,
  pajak: String,
  kilometer: Number,
  fotos: [String],
  dp: Number,
  angsuran_4_thn: Number,
  angsuran_5_tahun: Number,
  STNK: String,
  BPKB: String,
  Faktur: String,
  harga: Number,
  status: {
    type: String,
    enum: ['tersedia', 'terjual'],
    default: 'tersedia',
  },
  deskripsi: String,
});

const Mobil = models.Mobil || mongoose.model('Mobil', MobilSchema);

export default Mobil;
