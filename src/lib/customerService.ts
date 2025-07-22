// src/lib/customerService.ts
import connectMongo from "@/lib/conn";
import Pelanggan from "@/models/Pelanggan";
import ActivityLog from "@/models/ActivityLog";

interface CustomerData {
  nama: string;
  noHp: string;
  mobilId: string;
  activityType:
    | "view_detail"
    | "beli_cash"
    | "simulasi_kredit"
    | "booking_test_drive";
  additionalData?: any;
}

export async function saveCustomerActivity(data: CustomerData) {
  try {
    await connectMongo();

    // Format nomor HP
    const formattedHp = formatWhatsappNumber(data.noHp);

    // Cari atau buat pelanggan
    let pelanggan = await Pelanggan.findOne({ noHp: formattedHp });

    if (!pelanggan) {
      // Buat pelanggan baru
      pelanggan = new Pelanggan({
        nama: data.nama.trim(),
        noHp: formattedHp,
        status: "Belum Di Follow Up",
        totalInteractions: 1,
      });
      await pelanggan.save();
    } else {
      // Update pelanggan existing
      pelanggan.nama = data.nama.trim(); // Update nama jika berubah
      pelanggan.lastActivity = new Date();
      pelanggan.totalInteractions += 1;
      await pelanggan.save();
    }

    // Simpan activity log
    const activityLog = new ActivityLog({
      pelangganId: pelanggan._id,
      mobilId: data.mobilId,
      activityType: data.activityType,
      additionalData: data.additionalData || {},
    });
    await activityLog.save();

    return { success: true, pelangganId: pelanggan._id };
  } catch (error) {
    console.error("Error saving customer activity:", error);
    return { success: false, error: error.message };
  }
}

function formatWhatsappNumber(number: string): string {
  const cleanNumber = number.replace(/\D/g, "");

  if (cleanNumber.startsWith("08")) {
    return "+62" + cleanNumber.substring(1);
  } else if (cleanNumber.startsWith("8")) {
    return "+62" + cleanNumber;
  } else if (cleanNumber.startsWith("628")) {
    return "+" + cleanNumber;
  } else if (cleanNumber.startsWith("62")) {
    return "+" + cleanNumber;
  }

  return number;
}

// Analytics functions
export async function getMobilAnalytics(year?: number, month?: number) {
  try {
    await connectMongo();

    const matchCondition: any = {};

    if (year || month) {
      const dateFilter: any = {};
      if (year) dateFilter.$gte = new Date(year, month ? month - 1 : 0, 1);
      if (year && month) {
        dateFilter.$lt = new Date(year, month, 1);
      } else if (year) {
        dateFilter.$lt = new Date(year + 1, 0, 1);
      }
      matchCondition.createdAt = dateFilter;
    }

    const analytics = await ActivityLog.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "mobils",
          localField: "mobilId",
          foreignField: "_id",
          as: "mobil",
        },
      },
      { $unwind: "$mobil" },
      {
        $group: {
          _id: {
            mobilId: "$mobilId",
            activityType: "$activityType",
            merek: "$mobil.merek",
            tipe: "$mobil.tipe",
            tahun: "$mobil.tahun",
            noPol: "$mobil.noPol",
          },
          count: { $sum: 1 },
          lastActivity: { $max: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$_id.mobilId",
          merek: { $first: "$_id.merek" },
          tipe: { $first: "$_id.tipe" },
          tahun: { $first: "$_id.tahun" },
          noPol: { $first: "$_id.noPol" },
          activities: {
            $push: {
              type: "$_id.activityType",
              count: "$count",
              lastActivity: "$lastActivity",
            },
          },
          totalInteractions: { $sum: "$count" },
        },
      },
      { $sort: { totalInteractions: -1 } },
    ]);

    return analytics;
  } catch (error) {
    console.error("Error getting mobil analytics:", error);
    return [];
  }
}

export async function getTopMobilsByActivity(
  activityType: string,
  limit = 10,
  year?: number,
  month?: number
) {
  try {
    await connectMongo();

    const matchCondition: any = { activityType };

    if (year || month) {
      const dateFilter: any = {};
      if (year) dateFilter.$gte = new Date(year, month ? month - 1 : 0, 1);
      if (year && month) {
        dateFilter.$lt = new Date(year, month, 1);
      } else if (year) {
        dateFilter.$lt = new Date(year + 1, 0, 1);
      }
      matchCondition.createdAt = dateFilter;
    }

    const topMobils = await ActivityLog.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "mobils",
          localField: "mobilId",
          foreignField: "_id",
          as: "mobil",
        },
      },
      { $unwind: "$mobil" },
      {
        $group: {
          _id: "$mobilId",
          merek: { $first: "$mobil.merek" },
          tipe: { $first: "$mobil.tipe" },
          tahun: { $first: "$mobil.tahun" },
          noPol: { $first: "$mobil.noPol" },
          harga: { $first: "$mobil.harga" },
          count: { $sum: 1 },
          lastActivity: { $max: "$createdAt" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return topMobils;
  } catch (error) {
    console.error("Error getting top mobils:", error);
    return [];
  }
}
