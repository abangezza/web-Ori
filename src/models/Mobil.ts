// src/models/Mobil.ts - FIXED VERSION
import mongoose, { Schema, models } from "mongoose";

// Embedded schema for test drives
const TestDriveSchema = new Schema(
  {
    pelangganId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pelanggan",
      required: true,
    },
    namaCustomer: {
      type: String,
      required: true,
      trim: true,
    },
    noHp: {
      type: String,
      required: true,
      trim: true,
    },
    tanggalTest: {
      type: Date,
      required: true,
    },
    waktu: {
      type: String,
      required: true,
      default: "10:00 - 11:00",
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

// Embedded schema for cash offers
const BeliCashSchema = new Schema(
  {
    pelangganId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pelanggan",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    hargaTawaran: {
      type: Number,
      required: true,
    },
    hargaAsli: {
      type: Number,
      required: true,
    },
    selisihHarga: {
      type: Number,
      required: true,
    },
    persentaseDiskon: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

// Embedded schema for credit simulation
const SimulasiKreditSchema = new Schema(
  {
    pelangganId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pelanggan",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    dp: {
      type: Number,
      required: true,
    },
    tenor: {
      type: String,
      enum: ["4 tahun", "5 tahun"],
      required: true,
    },
    angsuran: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Main Mobil Schema (BACKWARD COMPATIBLE - TIDAK MENGUBAH FIELD EXISTING)
const MobilSchema = new Schema(
  {
    // ✅ EXISTING FIELDS - TIDAK DIUBAH
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
      enum: ["tersedia", "terjual"],
      default: "tersedia",
    },
    deskripsi: String,

    // ✅ NEW EMBEDDED DOCUMENTS (Optional - backward compatible)
    interactions: {
      testDrives: {
        type: [TestDriveSchema],
        default: [],
      },
      beliCash: {
        type: [BeliCashSchema],
        default: [],
      },
      simulasiKredit: {
        type: [SimulasiKreditSchema],
        default: [],
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for better performance
MobilSchema.index({ status: 1 });
MobilSchema.index({ merek: 1, tipe: 1 });
MobilSchema.index({ harga: 1 });
MobilSchema.index({ "interactions.testDrives.status": 1 });
MobilSchema.index({ "interactions.beliCash.status": 1 });

const Mobil = models.Mobil || mongoose.model("Mobil", MobilSchema);

export default Mobil;
