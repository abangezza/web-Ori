// src/app/api/debug/data-sources/route.ts - DEBUG ENDPOINT
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import ActivityLog from "@/models/ActivityLog";

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const mobilId = searchParams.get("mobilId");

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databases: {},
      collections: {},
    };

    // Check database collections
    const collections = await connectMongo().then(async () => {
      const db = require("mongoose").connection.db;
      return await db.listCollections().toArray();
    });

    debugInfo.collections.available = collections.map((c) => c.name);

    // Check Mobil collection
    const mobilCount = await Mobil.countDocuments();
    const mobilsWithInteractions = await Mobil.countDocuments({
      interactions: { $exists: true },
    });
    const mobilsWithTestDrives = await Mobil.countDocuments({
      "interactions.testDrives": { $exists: true, $ne: [] },
    });
    const mobilsWithCashOffers = await Mobil.countDocuments({
      "interactions.beliCash": { $exists: true, $ne: [] },
    });

    debugInfo.databases.mobils = {
      total: mobilCount,
      withInteractions: mobilsWithInteractions,
      withTestDrives: mobilsWithTestDrives,
      withCashOffers: mobilsWithCashOffers,
    };

    // Check ActivityLog collection
    const activityLogCount = await ActivityLog.countDocuments();
    const testDriveActivities = await ActivityLog.countDocuments({
      activityType: "booking_test_drive",
    });
    const cashOfferActivities = await ActivityLog.countDocuments({
      activityType: "beli_cash",
    });
    const creditSimActivities = await ActivityLog.countDocuments({
      activityType: "simulasi_kredit",
    });

    debugInfo.databases.activityLogs = {
      total: activityLogCount,
      testDrives: testDriveActivities,
      cashOffers: cashOfferActivities,
      creditSimulations: creditSimActivities,
    };

    // If specific mobil requested, get detailed info
    if (mobilId) {
      const mobil = await Mobil.findById(mobilId);
      if (mobil) {
        debugInfo.specificMobil = {
          _id: mobil._id,
          name: `${mobil.merek} ${mobil.tipe} ${mobil.tahun}`,
          noPol: mobil.noPol,
          hasInteractions: !!mobil.interactions,
          interactions: mobil.interactions
            ? {
                testDrives: mobil.interactions.testDrives?.length || 0,
                beliCash: mobil.interactions.beliCash?.length || 0,
                simulasiKredit: mobil.interactions.simulasiKredit?.length || 0,
              }
            : null,
        };

        // Get related ActivityLog entries
        const relatedActivities = await ActivityLog.find({ mobilId })
          .populate("pelangganId", "nama noHp")
          .select("activityType additionalData createdAt pelangganId");

        debugInfo.specificMobil.relatedActivities = relatedActivities.map(
          (a) => ({
            _id: a._id,
            activityType: a.activityType,
            customerName: a.pelangganId?.nama || "Unknown",
            customerPhone: a.pelangganId?.noHp || "Unknown",
            createdAt: a.createdAt,
            hasAdditionalData: !!a.additionalData,
          })
        );
      } else {
        debugInfo.specificMobil = { error: "Mobil not found" };
      }
    }

    // Sample data from each collection
    const sampleMobil = await Mobil.findOne({
      interactions: { $exists: true },
    }).select("merek tipe interactions");

    if (sampleMobil) {
      debugInfo.sampleData = {
        mobilWithInteractions: {
          _id: sampleMobil._id,
          name: `${sampleMobil.merek} ${sampleMobil.tipe}`,
          interactionsStructure: sampleMobil.interactions
            ? {
                hasTestDrives: Array.isArray(
                  sampleMobil.interactions.testDrives
                ),
                hasBeliCash: Array.isArray(sampleMobil.interactions.beliCash),
                hasSimulasiKredit: Array.isArray(
                  sampleMobil.interactions.simulasiKredit
                ),
                testDrivesCount:
                  sampleMobil.interactions.testDrives?.length || 0,
                beliCashCount: sampleMobil.interactions.beliCash?.length || 0,
                simulasiKreditCount:
                  sampleMobil.interactions.simulasiKredit?.length || 0,
              }
            : null,
        },
      };
    }

    const sampleActivity = await ActivityLog.findOne()
      .populate("pelangganId", "nama noHp")
      .populate("mobilId", "merek tipe");

    if (sampleActivity) {
      debugInfo.sampleData = {
        ...debugInfo.sampleData,
        activityLogEntry: {
          _id: sampleActivity._id,
          activityType: sampleActivity.activityType,
          customer: sampleActivity.pelangganId?.nama || "Unknown",
          mobil: sampleActivity.mobilId
            ? `${sampleActivity.mobilId.merek} ${sampleActivity.mobilId.tipe}`
            : "Unknown",
          hasAdditionalData: !!sampleActivity.additionalData,
          createdAt: sampleActivity.createdAt,
        },
      };
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
