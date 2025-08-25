// src/models/Pelanggan.ts - FIXED VERSION
import { Schema, model, models } from "mongoose";

// Embedded schema for interaction history
const InteractionHistorySchema = new Schema(
  {
    mobilId: {
      type: Schema.Types.ObjectId,
      ref: "Mobil",
      required: true,
    },
    mobilInfo: {
      merek: { type: String, required: true },
      tipe: { type: String, required: true },
      tahun: { type: Number, required: true },
      noPol: { type: String, required: true },
      harga: { type: Number, required: true },
    },
    activityType: {
      type: String,
      enum: ["view_detail", "test_drive", "simulasi_kredit", "beli_cash"],
      required: true,
    },
    details: {
      type: Schema.Types.Mixed, // Flexible untuk berbagai jenis detail
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Summary statistics schema
const SummaryStatsSchema = new Schema(
  {
    totalViews: { type: Number, default: 0 },
    totalTestDrives: { type: Number, default: 0 },
    totalSimulasiKredit: { type: Number, default: 0 },
    totalTawaranCash: { type: Number, default: 0 },
    mobilsFavorite: [
      {
        type: Schema.Types.ObjectId,
        ref: "Mobil",
      },
    ],
    averageOfferDiscount: { type: Number, default: 0 }, // dalam persen
    preferredPriceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

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
    // ✅ FIXED: Extended status enum to support new business logic
    status: {
      type: String,
      enum: [
        "Belum Di Follow Up",
        "Sudah Di Follow Up",
        "Interested",
        "Hot Lead",
        "Purchased",
      ],
      default: "Belum Di Follow Up",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Track total interactions (EXISTING - TIDAK DIUBAH)
    totalInteractions: {
      type: Number,
      default: 1,
    },

    // ✅ NEW DETAILED INTERACTION HISTORY (Optional - backward compatible)
    interactionHistory: {
      type: [InteractionHistorySchema],
      default: [],
    },

    // ✅ NEW SUMMARY STATISTICS (Optional - backward compatible)
    summaryStats: {
      type: SummaryStatsSchema,
      default: () => ({
        totalViews: 0,
        totalTestDrives: 0,
        totalSimulasiKredit: 0,
        totalTawaranCash: 0,
        mobilsFavorite: [],
        averageOfferDiscount: 0,
        preferredPriceRange: { min: 0, max: 0 },
      }),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
PelangganSchema.index({ noHp: 1 });
PelangganSchema.index({ status: 1 });
PelangganSchema.index({ lastActivity: -1 });
PelangganSchema.index({ totalInteractions: -1 });
PelangganSchema.index({ "interactionHistory.activityType": 1 });
PelangganSchema.index({ "interactionHistory.timestamp": -1 });

// Method untuk update summary stats
PelangganSchema.methods.updateSummaryStats = function () {
  const history = this.interactionHistory || [];

  this.summaryStats = this.summaryStats || {};
  this.summaryStats.totalViews = history.filter(
    (h) => h.activityType === "view_detail"
  ).length;
  this.summaryStats.totalTestDrives = history.filter(
    (h) => h.activityType === "test_drive"
  ).length;
  this.summaryStats.totalSimulasiKredit = history.filter(
    (h) => h.activityType === "simulasi_kredit"
  ).length;
  this.summaryStats.totalTawaranCash = history.filter(
    (h) => h.activityType === "beli_cash"
  ).length;

  // Calculate average discount from cash offers
  const cashOffers = history
    .filter(
      (h) => h.activityType === "beli_cash" && h.details?.persentaseDiskon
    )
    .map((h) => h.details.persentaseDiskon);

  if (cashOffers.length > 0) {
    this.summaryStats.averageOfferDiscount =
      cashOffers.reduce((sum, discount) => sum + discount, 0) /
      cashOffers.length;
  }

  // Find preferred price range
  const viewedPrices = history
    .filter((h) => h.mobilInfo?.harga)
    .map((h) => h.mobilInfo.harga);

  if (viewedPrices.length > 0) {
    this.summaryStats.preferredPriceRange =
      this.summaryStats.preferredPriceRange || {};
    this.summaryStats.preferredPriceRange.min = Math.min(...viewedPrices);
    this.summaryStats.preferredPriceRange.max = Math.max(...viewedPrices);
  }

  // Update mobils favorite (most viewed)
  const mobilCounts = {};
  history.forEach((h) => {
    if (h.mobilId) {
      const mobilIdStr = h.mobilId.toString();
      mobilCounts[mobilIdStr] = (mobilCounts[mobilIdStr] || 0) + 1;
    }
  });

  const sortedMobils = Object.entries(mobilCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3) // top 3 favorite mobils
    .map(([mobilId]) => mobilId);

  this.summaryStats.mobilsFavorite = sortedMobils;
};

const Pelanggan = models.Pelanggan || model("Pelanggan", PelangganSchema);
export default Pelanggan;
