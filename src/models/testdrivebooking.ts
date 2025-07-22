// models/testdrivebooking.ts

import mongoose, { Schema, model, models } from "mongoose";

const TestDriveBookingSchema = new Schema(
  {
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
    mobilId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mobil", // nama model Mobil (bukan nama koleksi 'mobils')
      required: true,
    },
    tanggalTest: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // otomatis createdAt dan updatedAt
  }
);

// Cegah error saat hot reload
const TestDriveBooking =
  models.TestDriveBooking ||
  model("TestDriveBooking", TestDriveBookingSchema);

export default TestDriveBooking;
