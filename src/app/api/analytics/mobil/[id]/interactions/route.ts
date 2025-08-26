// src/app/api/mobil/[id]/interactions/route.ts - COMPLETE IMPLEMENTATION
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
    console.log(`Fetching interactions for mobil: ${mobilId}`);

    // Get mobil info
    const mobil = await Mobil.findById(mobilId);
    if (!mobil) {
      return NextResponse.json(
        { success: false, error: "Mobil not found" },
        { status: 404 }
      );
    }

    const interactions: any[] = [];

    // 1. Get NEW embedded interactions from mobil document
    console.log(`Checking embedded interactions...`);
    if (mobil.interactions) {
      // Test Drives from embedded
      if (mobil.interactions.testDrives?.length > 0) {
        console.log(
          `Found ${mobil.interactions.testDrives.length} embedded test drives`
        );
        for (const testDrive of mobil.interactions.testDrives) {
          interactions.push({
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
          });
        }
      }

      // Cash Offers from embedded
      if (mobil.interactions.beliCash?.length > 0) {
        console.log(
          `Found ${mobil.interactions.beliCash.length} embedded cash offers`
        );
        for (const cashOffer of mobil.interactions.beliCash) {
          interactions.push({
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
          });
        }
      }

      // Credit Simulations from embedded
      if (mobil.interactions.simulasiKredit?.length > 0) {
        console.log(
          `Found ${mobil.interactions.simulasiKredit.length} embedded credit simulations`
        );
        for (const simulation of mobil.interactions.simulasiKredit) {
          interactions.push({
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
          });
        }
      }
    }

    // 2. Get LEGACY interactions from ActivityLog collection
    console.log(`Checking legacy ActivityLog...`);
    const legacyActivities = await ActivityLog.find({ mobilId })
      .populate("pelangganId", "nama noHp")
      .sort({ createdAt: -1 });

    console.log(`Found ${legacyActivities.length} legacy activities`);

    for (const activity of legacyActivities) {
      // Skip if we already have this interaction from embedded data
      const alreadyExists = interactions.some(
        (interaction) =>
          interaction.activityType === activity.activityType &&
          interaction.customerPhone === activity.pelangganId?.noHp &&
          Math.abs(
            new Date(interaction.timestamp).getTime() -
              activity.createdAt.getTime()
          ) < 60000 // Within 1 minute
      );

      if (!alreadyExists && activity.pelangganId) {
        interactions.push({
          _id: activity._id.toString(),
          customerName: activity.pelangganId.nama,
          customerPhone: activity.pelangganId.noHp,
          activityType: activity.activityType,
          timestamp: activity.createdAt,
          details: activity.additionalData || {},
          source: "legacy",
        });
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

    console.log(`Total interactions found: ${interactions.length}`);
    console.log(`Stats:`, stats);

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
      },
    });
  } catch (error) {
    console.error("Error fetching mobil interactions:", error);

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

// PATCH endpoint to update interaction status (for admin actions)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();

    const mobilId = params.id;
    const body = await request.json();
    const { interactionId, interactionType, status, notes } = body;

    console.log(
      `Updating interaction: ${interactionId}, type: ${interactionType}, status: ${status}`
    );

    // Validate required fields
    if (!interactionId || !interactionType || !status) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: interactionId, interactionType, status",
        },
        { status: 400 }
      );
    }

    // Get mobil
    const mobil = await Mobil.findById(mobilId);
    if (!mobil) {
      return NextResponse.json(
        { success: false, error: "Mobil not found" },
        { status: 404 }
      );
    }

    let updated = false;

    // Update embedded interactions
    if (mobil.interactions) {
      if (interactionType === "test_drive" && mobil.interactions.testDrives) {
        const testDriveIndex = mobil.interactions.testDrives.findIndex(
          (td) => td._id.toString() === interactionId
        );
        if (testDriveIndex !== -1) {
          mobil.interactions.testDrives[testDriveIndex].status = status;
          if (notes) {
            mobil.interactions.testDrives[testDriveIndex].notes = notes;
          }
          updated = true;
        }
      }

      if (interactionType === "beli_cash" && mobil.interactions.beliCash) {
        const cashOfferIndex = mobil.interactions.beliCash.findIndex(
          (co) => co._id.toString() === interactionId
        );
        if (cashOfferIndex !== -1) {
          mobil.interactions.beliCash[cashOfferIndex].status = status;
          if (notes) {
            mobil.interactions.beliCash[cashOfferIndex].notes = notes;
          }
          updated = true;
        }
      }
    }

    if (updated) {
      await mobil.save();

      return NextResponse.json({
        success: true,
        message: "Interaction status updated successfully",
        data: {
          interactionId,
          newStatus: status,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Try updating in legacy ActivityLog as fallback
      const activity = await ActivityLog.findById(interactionId);
      if (activity) {
        activity.additionalData = {
          ...activity.additionalData,
          status,
          notes: notes || activity.additionalData?.notes,
          updatedAt: new Date(),
        };
        await activity.save();

        return NextResponse.json({
          success: true,
          message: "Interaction status updated successfully (legacy)",
          data: {
            interactionId,
            newStatus: status,
            timestamp: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json(
        { success: false, error: "Interaction not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating interaction status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update interaction status",
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
