// src/models/ActivityLog.ts
import mongoose, { Schema, model, models } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    pelangganId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pelanggan",
      required: true,
    },
    mobilId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mobil",
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "view_detail",
        "beli_cash",
        "simulasi_kredit",
        "booking_test_drive",
      ],
      required: true,
    },
    additionalData: {
      type: Schema.Types.Mixed, // Flexible data for different activity types
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk performa
ActivityLogSchema.index({ pelangganId: 1 });
ActivityLogSchema.index({ mobilId: 1 });
ActivityLogSchema.index({ activityType: 1 });
ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog =
  models.ActivityLog || model("ActivityLog", ActivityLogSchema);
export default ActivityLog;
