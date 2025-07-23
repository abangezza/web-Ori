// src/models/Pelanggan.ts
import { Schema, model, models } from "mongoose";

const PelangganSchema = new Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    noHp: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Belum Di Follow Up", "Sudah Di Follow Up"],
      default: "Belum Di Follow Up",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Track total interactions
    totalInteractions: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Pelanggan = models.Pelanggan || model("Pelanggan", PelangganSchema);
export default Pelanggan;
