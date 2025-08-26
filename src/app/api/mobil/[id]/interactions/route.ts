// src/app/api/mobil/[id]/interactions/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/conn";
import Mobil from "@/models/Mobil";
import ActivityLog from "@/models/ActivityLog";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const mobilId = params.id;
    console.log(`🔍 Fetching interactions for mobil: ${mobilId}`);

    // Get mobil info
    const mobil = await Mobil.findById(mobilId);
    if (!mobil) {
      console.log(`❌ Mobil not found: ${mobilId}`);
      return NextResponse.json(
        { success: false, error: "Mobil not found" },
        { status: 404 }
      );
    }

    const interactions: any[] = [];
    const seenKeys = new Set<string>();

    console.log(
      `📱 Found mobil: ${mobil.merek} ${mobil.tipe} (${mobil.noPol})`
    );

    // Helper function to create unique key for deduplication
    const createUniqueKey = (item: any): string => {
      const timestamp = new Date(item.timestamp);
      const dateStr = timestamp.toISOString().split("T")[0]; // YYYY-MM-DD only
      return `${item.customerPhone}_${item.activityType}_${dateStr}`;
    };

    // 1. Get NEW embedded interactions from mobil document (PRIORITY)
    if (mobil.interactions) {
      console.log(`📋 Checking embedded interactions...`);

      // Test Drives from embedded
      if (mobil.interactions.testDrives?.length > 0) {
        console.log(
          `Found ${mobil.interactions.testDrives.length} embedded test drives`
        );
        for (const testDrive of mobil.interactions.testDrives) {
          const interactionData = {
            _id: testDrive._id.toString(),
            customerName: testDrive.namaCustomer,
            customerPhone: testDrive.noHp,
            activityType: "test_drive",
            timestamp: testDrive.createdAt || testDrive.tanggalTest,
            status: testDrive.status,
            details: {
              tanggalTest: testDrive.tanggalTest,
              waktu: testDrive.waktu,
              status: testDrive.status,
              notes: testDrive.notes,
            },
            source: "embedded",
          };

          const uniqueKey = createUniqueKey(interactionData);
          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            interactions.push(interactionData);
            console.log(
              `✅ Added embedded test drive: ${interactionData.customerName}`
            );
          }
        }
      }

      // Cash Offers from embedded
      if (mobil.interactions.beliCash?.length > 0) {
        console.log(
          `Found ${mobil.interactions.beliCash.length} embedded cash offers`
        );
        for (const cashOffer of mobil.interactions.beliCash) {
          const interactionData = {
            _id: cashOffer._id.toString(),
            customerName: cashOffer.customerName,
            customerPhone: cashOffer.customerPhone,
            activityType: "beli_cash",
            timestamp: cashOffer.timestamp,
            status: cashOffer.status,
            details: {
              hargaTawaran: cashOffer.hargaTawaran,
              hargaAsli: cashOffer.hargaAsli,
              selisihHarga: cashOffer.selisihHarga,
              persentaseDiskon: cashOffer.persentaseDiskon,
              status: cashOffer.status,
              notes: cashOffer.notes,
            },
            source: "embedded",
          };

          const uniqueKey = createUniqueKey(interactionData);
          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            interactions.push(interactionData);
            console.log(
              `✅ Added embedded cash offer: ${interactionData.customerName}`
            );
          }
        }
      }

      // Credit Simulations from embedded
      if (mobil.interactions.simulasiKredit?.length > 0) {
        console.log(
          `Found ${mobil.interactions.simulasiKredit.length} embedded credit simulations`
        );
        for (const simulation of mobil.interactions.simulasiKredit) {
          const interactionData = {
            _id: simulation._id.toString(),
            customerName: simulation.customerName,
            customerPhone: simulation.customerPhone,
            activityType: "simulasi_kredit",
            timestamp: simulation.timestamp,
            details: {
              dp: simulation.dp,
              tenor: simulation.tenor,
              angsuran: simulation.angsuran,
            },
            source: "embedded",
          };

          const uniqueKey = createUniqueKey(interactionData);
          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            interactions.push(interactionData);
            console.log(
              `✅ Added embedded credit simulation: ${interactionData.customerName}`
            );
          }
        }
      }
    }

    // 2. Get LEGACY interactions from ActivityLog collection (FALLBACK ONLY)
    console.log(`📋 Checking legacy ActivityLog...`);
    const legacyActivities = await ActivityLog.find({ mobilId })
      .populate("pelangganId", "nama noHp")
      .sort({ createdAt: -1 });

    console.log(`Found ${legacyActivities.length} legacy activities`);

    for (const activity of legacyActivities) {
      if (activity.pelangganId) {
        const interactionData = {
          _id: activity._id.toString(),
          customerName: activity.pelangganId.nama,
          customerPhone: activity.pelangganId.noHp,
          activityType: activity.activityType,
          timestamp: activity.createdAt,
          details: activity.additionalData || {},
          source: "legacy",
        };

        const uniqueKey = createUniqueKey(interactionData);
        if (!seenKeys.has(uniqueKey)) {
          seenKeys.add(uniqueKey);
          interactions.push(interactionData);
          console.log(
            `✅ Added legacy activity: ${interactionData.customerName} - ${interactionData.activityType}`
          );
        } else {
          console.log(
            `⚠️ Skipped duplicate legacy activity: ${interactionData.customerName} - ${interactionData.activityType}`
          );
        }
      }
    }

    // Sort all interactions by timestamp (newest first)
    interactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Calculate stats
    const stats = {
      total: interactions.length,
      byType: {
        view_detail: interactions.filter(
          (i) => i.activityType === "view_detail"
        ).length,
        test_drive: interactions.filter((i) => i.activityType === "test_drive")
          .length,
        simulasi_kredit: interactions.filter(
          (i) => i.activityType === "simulasi_kredit"
        ).length,
        beli_cash: interactions.filter((i) => i.activityType === "beli_cash")
          .length,
      },
      bySource: {
        embedded: interactions.filter((i) => i.source === "embedded").length,
        legacy: interactions.filter((i) => i.source === "legacy").length,
      },
      uniqueCustomers: new Set(interactions.map((i) => i.customerPhone)).size,
      recent: interactions.filter(
        (i) =>
          new Date().getTime() - new Date(i.timestamp).getTime() <
          7 * 24 * 60 * 60 * 1000
      ).length, // Last 7 days
    };

    console.log(`🎯 Final result: ${interactions.length} unique interactions`);
    console.log(`📊 Stats:`, stats);

    return NextResponse.json({
      success: true,
      data: {
        mobilInfo: {
          _id: mobil._id,
          merek: mobil.merek,
          tipe: mobil.tipe,
          tahun: mobil.tahun,
          noPol: mobil.noPol,
          harga: mobil.harga,
        },
        interactions,
        stats,
      },
      meta: {
        timestamp: new Date().toISOString(),
        hybridSources: {
          embedded: interactions.filter((i) => i.source === "embedded").length,
          legacy: interactions.filter((i) => i.source === "legacy").length,
        },
        debug: {
          mobilHasEmbeddedData: !!mobil.interactions,
          embeddedTestDrives: mobil.interactions?.testDrives?.length || 0,
          embeddedCashOffers: mobil.interactions?.beliCash?.length || 0,
          embeddedCreditSims: mobil.interactions?.simulasiKredit?.length || 0,
          legacyActivities: legacyActivities.length,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching mobil interactions:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch mobil interactions",
        message:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
