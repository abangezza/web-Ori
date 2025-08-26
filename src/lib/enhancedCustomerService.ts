// src/lib/enhancedCustomerService.ts — COMPLETE MERGED + DEDUP VERSION
import connectMongo from "@/lib/conn";
import Pelanggan from "@/models/Pelanggan";
import Mobil from "@/models/Mobil";
import ActivityLog from "@/models/ActivityLog";
import TestDriveBooking from "@/models/testdrivebooking";
import { BusinessLogic } from "@/lib/businessLogic";

interface CustomerActivityData {
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

interface SaveActivityResult {
  success: boolean;
  pelangganId?: string;
  newStatus?: string;
  validation?: any;
  error?: string;
}

export class EnhancedCustomerService {
  /**
   * Save customer activity with enhanced tracking (HYBRID APPROACH)
   */
  static async saveCustomerActivity(
    data: CustomerActivityData
  ): Promise<SaveActivityResult> {
    try {
      await connectMongo();

      const formattedHp = BusinessLogic.formatWhatsappNumber(data.noHp);

      const mobil = await Mobil.findById(data.mobilId);
      if (!mobil) return { success: false, error: "Mobil not found" };

      // Validate cash offer
      let validation: any = null;
      if (
        data.activityType === "beli_cash" &&
        data.additionalData?.hargaTawaran
      ) {
        validation = BusinessLogic.validateCashOffer(
          mobil.harga,
          data.additionalData.hargaTawaran
        );
        if (!validation.isValid) {
          return { success: false, error: validation.errorMessage, validation };
        }
      }

      // Find or create customer
      let pelanggan = await Pelanggan.findOne({ noHp: formattedHp });
      if (!pelanggan) {
        pelanggan = new Pelanggan({
          nama: data.nama.trim(),
          noHp: formattedHp,
          status: "Belum Di Follow Up",
          totalInteractions: 1,
          interactionHistory: [],
          summaryStats: {
            totalViews: 0,
            totalTestDrives: 0,
            totalSimulasiKredit: 0,
            totalTawaranCash: 0,
            mobilsFavorite: [],
            averageOfferDiscount: 0,
            preferredPriceRange: { min: 0, max: 0 },
          },
        });
      } else {
        pelanggan.nama = data.nama.trim();
        pelanggan.lastActivity = new Date();
        pelanggan.totalInteractions += 1;
      }

      // Status update
      const statusUpdate = BusinessLogic.updateCustomerStatus(
        data.activityType,
        pelanggan.status
      );
      if (statusUpdate.shouldUpdate) pelanggan.status = statusUpdate.newStatus;

      // Interaction history
      const interactionDetails = this.buildInteractionDetails(data);
      if (!pelanggan.interactionHistory) pelanggan.interactionHistory = [];
      pelanggan.interactionHistory.push({
        mobilId: mobil._id,
        mobilInfo: {
          merek: mobil.merek,
          tipe: mobil.tipe,
          tahun: mobil.tahun,
          noPol: mobil.noPol,
          harga: mobil.harga,
        },
        activityType:
          data.activityType === "booking_test_drive"
            ? "test_drive"
            : data.activityType,
        details: interactionDetails,
        timestamp: new Date(),
      });

      if (typeof (pelanggan as any).updateSummaryStats === "function") {
        (pelanggan as any).updateSummaryStats();
      }

      await pelanggan.save();

      // Embedded interactions pada Mobil
      await this.addMobilInteraction(
        mobil._id.toString(),
        pelanggan._id.toString(),
        data,
        validation
      );

      // Legacy log untuk analytics
      const activityLog = new ActivityLog({
        pelangganId: pelanggan._id,
        mobilId: data.mobilId,
        activityType: data.activityType,
        additionalData: data.additionalData || {},
      });
      await activityLog.save();

      return {
        success: true,
        pelangganId: pelanggan._id.toString(),
        newStatus: pelanggan.status,
        validation,
      };
    } catch (error) {
      console.error("Error saving customer activity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Tambahan: Improved deduplication key generator
   */
  static createUniqueKey(
    item: any,
    type: "offer" | "booking" | "interaction"
  ): string {
    if (type === "offer") {
      // For cash offers: customer phone + mobil ID + offer amount
      return `${item.customerPhone}_${item.mobil._id}_${item.hargaTawaran}`;
    } else if (type === "booking") {
      // For test drives: customer phone + mobil ID + date (YYYY-MM-DD only)
      const testDate = new Date(item.tanggalTest);
      const dateStr = testDate.toISOString().split("T")[0];
      return `${item.noHp}_${item.mobil._id}_${dateStr}`;
    } else if (type === "interaction") {
      // For interactions: customer phone + activity type + date
      const timestamp = new Date(item.timestamp);
      const dateStr = timestamp.toISOString().split("T")[0];
      return `${item.customerPhone}_${item.activityType}_${dateStr}`;
    }
    return item._id?.toString?.() ?? String(item._id);
  }

  /**
   * Add interaction to mobil embedded document
   */
  private static async addMobilInteraction(
    mobilId: string,
    pelangganId: string,
    data: CustomerActivityData,
    validation?: any
  ): Promise<void> {
    try {
      const updateData: any = {};

      switch (data.activityType) {
        case "booking_test_drive":
          updateData["$push"] = {
            "interactions.testDrives": {
              pelangganId,
              namaCustomer: data.nama,
              noHp: BusinessLogic.formatWhatsappNumber(data.noHp),
              tanggalTest: data.additionalData?.tanggalTest || new Date(),
              waktu: data.additionalData?.waktu || "10:00 - 11:00",
              status: "active",
              createdAt: new Date(),
              notes: data.additionalData?.notes || "",
            },
          };
          break;
        case "beli_cash":
          if (validation?.isValid) {
            updateData["$push"] = {
              "interactions.beliCash": {
                pelangganId,
                customerName: data.nama,
                customerPhone: BusinessLogic.formatWhatsappNumber(data.noHp),
                hargaTawaran: data.additionalData.hargaTawaran,
                hargaAsli: validation?.minAcceptable + validation?.discount,
                selisihHarga: validation?.discount,
                persentaseDiskon: validation?.discountPercentage,
                status: "pending",
                timestamp: new Date(),
                notes: data.additionalData?.notes || "",
              },
            };
          }
          break;
        case "simulasi_kredit":
          updateData["$push"] = {
            "interactions.simulasiKredit": {
              pelangganId,
              customerName: data.nama,
              customerPhone: BusinessLogic.formatWhatsappNumber(data.noHp),
              dp: data.additionalData?.dp || 0,
              tenor: data.additionalData?.tenorCicilan
                ? `${data.additionalData.tenorCicilan} tahun`
                : "4 tahun",
              angsuran: data.additionalData?.angsuran || 0,
              timestamp: new Date(),
            },
          };
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await Mobil.findByIdAndUpdate(mobilId, updateData);
      }
    } catch (error) {
      console.error("Error adding mobil interaction:", error);
    }
  }

  /**
   * Build interaction details
   */
  private static buildInteractionDetails(data: CustomerActivityData): any {
    const base = data.additionalData || {};
    switch (data.activityType) {
      case "view_detail":
        return {
          duration: base.duration || 0,
          userAgent: base.userAgent || "",
          referrer: base.referrer || "",
        };
      case "test_drive":
      case "booking_test_drive":
        return {
          tanggalTest: base.tanggalTest || new Date(),
          waktu: base.waktu || "10:00 - 11:00",
          status: "active",
        };
      case "simulasi_kredit":
        return {
          dp: base.dp || 0,
          tenor: base.tenorCicilan ? `${base.tenorCicilan} tahun` : "4 tahun",
          angsuran: base.angsuran || 0,
        };
      case "beli_cash":
        return { hargaTawaran: base.hargaTawaran || 0, status: "pending" };
      default:
        return base;
    }
  }

  /**
   * HYBRID: Customer + history
   */
  static async getCustomerWithHistory(pelangganId: string): Promise<any> {
    try {
      await connectMongo();

      const pelanggan = await Pelanggan.findById(pelangganId)
        .populate("interactionHistory.mobilId", "merek tipe tahun noPol harga")
        .populate(
          "summaryStats.mobilsFavorite",
          "merek tipe tahun noPol harga"
        );

      if (!pelanggan) return null;

      const oldActivities = await ActivityLog.find({ pelangganId })
        .populate("mobilId", "merek tipe tahun noPol harga")
        .sort({ createdAt: -1 });

      return { ...pelanggan.toObject(), fallbackActivities: oldActivities };
    } catch (error) {
      console.error("Error getting customer history:", error);
      return null;
    }
  }

  /**
   * HYBRID: Test drive bookings — FIXED DEDUPLICATION
   */
  static async getAllTestDriveBookings(): Promise<any[]> {
    try {
      await connectMongo();

      const bookings: any[] = [];
      const seenKeys = new Set<string>();

      console.log("🔍 Fetching test drive bookings...");

      // Embedded first (priority)
      const mobilsWithTestDrives = await Mobil.find({
        "interactions.testDrives": { $exists: true, $ne: [] },
      });

      console.log(
        `📱 Found ${mobilsWithTestDrives.length} mobils with embedded test drives`
      );

      for (const mobil of mobilsWithTestDrives as any[]) {
        if (mobil.interactions?.testDrives?.length > 0) {
          for (const testDrive of mobil.interactions.testDrives) {
            const bookingData = {
              _id: testDrive._id,
              namaCustomer: testDrive.namaCustomer,
              noHp: testDrive.noHp,
              tanggalTest: testDrive.tanggalTest,
              waktu: testDrive.waktu,
              status: testDrive.status,
              createdAt: testDrive.createdAt,
              notes: testDrive.notes,
              mobil: {
                _id: mobil._id,
                merek: mobil.merek,
                tipe: mobil.tipe,
                tahun: mobil.tahun,
                noPol: mobil.noPol,
                harga: mobil.harga,
              },
              source: "embedded",
            };

            const key = this.createUniqueKey(bookingData, "booking");
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              bookings.push(bookingData);
              console.log(
                `✅ Added embedded booking: ${bookingData.namaCustomer} - ${bookingData.mobil.merek} ${bookingData.mobil.tipe}`
              );
            } else {
              console.log(
                `⚠️ Skipped duplicate embedded booking: ${bookingData.namaCustomer}`
              );
            }
          }
        }
      }

      // Legacy fallback
      try {
        const legacyBookings = await TestDriveBooking.find({})
          .populate("mobilId", "merek tipe tahun noPol harga")
          .sort({ createdAt: -1 });

        console.log(
          `📋 Found ${legacyBookings.length} legacy test drive bookings`
        );

        for (const booking of legacyBookings as any[]) {
          if (!booking.mobilId) continue;

          const testDate = new Date(booking.tanggalTest);
          const isExpired = testDate < new Date();

          const bookingData = {
            _id: booking._id,
            namaCustomer: booking.namaCustomer,
            noHp: booking.noHp,
            tanggalTest: booking.tanggalTest,
            waktu: booking.waktu || "10:00 - 11:00",
            status: isExpired ? "expired" : booking.status || "active",
            createdAt: booking.createdAt,
            notes: booking.notes || "",
            mobil: {
              _id: booking.mobilId._id,
              merek: booking.mobilId.merek,
              tipe: booking.mobilId.tipe,
              tahun: booking.mobilId.tahun,
              noPol: booking.mobilId.noPol,
              harga: booking.mobilId.harga,
            },
            source: "legacy",
          };

          const key = this.createUniqueKey(bookingData, "booking");
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            bookings.push(bookingData);
            console.log(
              `✅ Added legacy booking: ${bookingData.namaCustomer} - ${bookingData.mobil.merek} ${bookingData.mobil.tipe}`
            );
          } else {
            console.log(
              `⚠️ Skipped duplicate legacy booking: ${bookingData.namaCustomer}`
            );
          }
        }
      } catch (error) {
        console.log(
          "⚠️ TestDriveBooking model not found, using embedded data only"
        );
      }

      bookings.sort(
        (a, b) =>
          new Date(b.tanggalTest).getTime() - new Date(a.tanggalTest).getTime()
      );

      console.log(
        `🎯 Final result: ${bookings.length} unique test drive bookings`
      );
      console.log(
        `📊 Sources: ${
          bookings.filter((b) => b.source === "embedded").length
        } embedded, ${
          bookings.filter((b) => b.source === "legacy").length
        } legacy`
      );

      return bookings;
    } catch (error) {
      console.error("❌ Error getting test drive bookings:", error);
      return [];
    }
  }

  /**
   * HYBRID: Customers with stats
   */
  static async getAllCustomersWithStats(): Promise<any[]> {
    try {
      await connectMongo();

      const customers = await Pelanggan.find({})
        .populate("summaryStats.mobilsFavorite", "merek tipe tahun noPol harga")
        .sort({ lastActivity: -1 });

      return customers.map((customer: any) => {
        const obj = customer.toObject();
        return {
          ...obj,
          priority: BusinessLogic.getCustomerPriority(
            customer.summaryStats || {},
            customer.lastActivity,
            customer.status
          ),
          engagementScore: BusinessLogic.calculateEngagementScore(
            customer.interactionHistory || []
          ),
          readyForFollowUp: BusinessLogic.isReadyForFollowUp(
            customer.interactionHistory || [],
            customer.lastActivity,
            customer.status
          ),
        };
      });
    } catch (error) {
      console.error("Error getting customers with stats:", error);
      return [];
    }
  }

  /**
   * FIXED DEDUPLICATION: Cash offers (embedded priority + legacy fallback)
   * Note: mengembalikan SEMUA offer. Jika perlu khusus "pending" saja,
   * tambahkan `.filter(o => o.status === "pending")` sebelum return.
   */
  static async getPendingCashOffers(): Promise<any[]> {
    try {
      await connectMongo();

      const offers: any[] = [];
      const seenKeys = new Set<string>();

      console.log("🔍 Fetching cash offers...");

      // Embedded first
      const mobilsWithOffers = await Mobil.find({
        "interactions.beliCash": { $exists: true, $ne: [] },
      });

      console.log(
        `📱 Found ${mobilsWithOffers.length} mobils with embedded cash offers`
      );

      for (const mobil of mobilsWithOffers as any[]) {
        if (mobil.interactions?.beliCash?.length > 0) {
          for (const cashOffer of mobil.interactions.beliCash) {
            const offerData = {
              _id: cashOffer._id,
              customerName: cashOffer.customerName,
              customerPhone: cashOffer.customerPhone,
              hargaTawaran: cashOffer.hargaTawaran,
              hargaAsli: cashOffer.hargaAsli,
              selisihHarga: cashOffer.selisihHarga,
              persentaseDiskon: cashOffer.persentaseDiskon,
              status: cashOffer.status,
              timestamp: cashOffer.timestamp,
              notes: cashOffer.notes,
              mobil: {
                _id: mobil._id,
                merek: mobil.merek,
                tipe: mobil.tipe,
                tahun: mobil.tahun,
                noPol: mobil.noPol,
                harga: mobil.harga,
              },
              source: "embedded",
            };

            const key = this.createUniqueKey(offerData, "offer");
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              offers.push(offerData);
              console.log(
                `✅ Added embedded offer: ${offerData.customerName} - ${offerData.mobil.merek} ${offerData.mobil.tipe}`
              );
            } else {
              console.log(
                `⚠️ Skipped duplicate embedded offer: ${offerData.customerName}`
              );
            }
          }
        }
      }

      // Legacy fallback (ActivityLog)
      const legacyOffers = await ActivityLog.find({ activityType: "beli_cash" })
        .populate("pelangganId", "nama noHp")
        .populate("mobilId", "merek tipe tahun noPol harga")
        .sort({ createdAt: -1 });

      console.log(
        `📋 Found ${legacyOffers.length} legacy cash offers in ActivityLog`
      );

      for (const activity of legacyOffers as any[]) {
        if (!activity.pelangganId || !activity.mobilId) continue;

        const hargaTawaran = activity.additionalData?.hargaTawaran || 0;
        const hargaAsli =
          activity.additionalData?.hargaAsli || activity.mobilId.harga;
        const selisihHarga = hargaAsli - hargaTawaran;
        const persentaseDiskon =
          hargaAsli > 0 ? (selisihHarga / hargaAsli) * 100 : 0;

        const offerData = {
          _id: activity._id,
          customerName: activity.pelangganId.nama,
          customerPhone: activity.pelangganId.noHp,
          hargaTawaran,
          hargaAsli,
          selisihHarga,
          persentaseDiskon: Math.round(persentaseDiskon * 100) / 100,
          status: activity.additionalData?.status || "pending",
          timestamp: activity.createdAt,
          notes: activity.additionalData?.notes || "",
          mobil: {
            _id: activity.mobilId._id,
            merek: activity.mobilId.merek,
            tipe: activity.mobilId.tipe,
            tahun: activity.mobilId.tahun,
            noPol: activity.mobilId.noPol,
            harga: activity.mobilId.harga,
          },
          source: "legacy",
        };

        const key = this.createUniqueKey(offerData, "offer");
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          offers.push(offerData);
          console.log(
            `✅ Added legacy offer: ${offerData.customerName} - ${offerData.mobil.merek} ${offerData.mobil.tipe}`
          );
        } else {
          console.log(
            `⚠️ Skipped duplicate legacy offer: ${offerData.customerName}`
          );
        }
      }

      offers.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log(`🎯 Final result: ${offers.length} unique cash offers`);
      console.log(
        `📊 Sources: ${
          offers.filter((o) => o.source === "embedded").length
        } embedded, ${
          offers.filter((o) => o.source === "legacy").length
        } legacy`
      );

      return offers;
    } catch (error) {
      console.error("❌ Error getting pending cash offers:", error);
      return [];
    }
  }

  /**
   * Update cash offer status (positional + fallback)
   */
  static async updateCashOfferStatus(
    mobilId: string,
    offerId: string,
    status: "accepted" | "rejected",
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await connectMongo();

      const result = await Mobil.updateOne(
        { _id: mobilId, "interactions.beliCash._id": offerId },
        {
          $set: {
            "interactions.beliCash.$.status": status,
            "interactions.beliCash.$.notes": notes || "",
            "interactions.beliCash.$.updatedAt": new Date(),
          },
        }
      );
      if (result.modifiedCount > 0)
        return { success: true, message: `Cash offer ${status} successfully` };

      const mobil = await Mobil.findById(mobilId);
      const idx =
        mobil?.interactions?.beliCash?.findIndex(
          (o: any) => o._id.toString() === offerId
        ) ?? -1;
      if (mobil && idx !== -1) {
        mobil.interactions.beliCash[idx].status = status;
        mobil.interactions.beliCash[idx].notes =
          notes || mobil.interactions.beliCash[idx].notes || "";
        (mobil.interactions.beliCash[idx] as any).updatedAt = new Date();
        await mobil.save();
        return { success: true, message: `Cash offer ${status} successfully` };
      }

      const activity = await ActivityLog.findById(offerId);
      if (activity && activity.activityType === "beli_cash") {
        activity.additionalData = {
          ...activity.additionalData,
          status,
          notes: notes || activity.additionalData?.notes,
          updatedAt: new Date(),
        };
        await activity.save();
        return {
          success: true,
          message: `Cash offer ${status} successfully (legacy)`,
        };
      }

      return {
        success: false,
        message: "Cash offer not found or already updated",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update test drive status (positional + legacy fallback)
   */
  static async updateTestDriveStatus(
    mobilId: string,
    bookingId: string,
    status: "completed" | "cancelled" | "expired",
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await connectMongo();

      const result = await Mobil.updateOne(
        { _id: mobilId, "interactions.testDrives._id": bookingId },
        {
          $set: {
            "interactions.testDrives.$.status": status,
            "interactions.testDrives.$.notes": notes || "",
            "interactions.testDrives.$.updatedAt": new Date(),
          },
        }
      );
      if (result.modifiedCount > 0)
        return { success: true, message: `Test drive ${status} successfully` };

      try {
        const booking = await TestDriveBooking.findById(bookingId);
        if (booking) {
          booking.status = status;
          if (notes) booking.notes = notes;
          await booking.save();
          return {
            success: true,
            message: `Test drive ${status} successfully (legacy)`,
          };
        }
      } catch {}

      return {
        success: false,
        message: "Test drive booking not found or already updated",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Auto-expire old test drives (arrayFilters + legacy)
   */
  static async expireOldTestDrives(): Promise<{ expired: number }> {
    try {
      await connectMongo();

      let expiredTotal = 0;
      const expiredTime = BusinessLogic.checkExpiredBookings();

      const res = await Mobil.updateMany(
        {
          "interactions.testDrives": {
            $elemMatch: { status: "active", tanggalTest: { $lt: expiredTime } },
          },
        },
        { $set: { "interactions.testDrives.$[elem].status": "expired" } },
        {
          arrayFilters: [
            {
              "elem.status": "active",
              "elem.tanggalTest": { $lt: expiredTime },
            },
          ],
        }
      );
      expiredTotal += (res as any).modifiedCount || 0;

      try {
        const legacyRes = await TestDriveBooking.updateMany(
          {
            status: { $in: ["active", null as any] },
            tanggalTest: { $lt: expiredTime },
          },
          { status: "expired" }
        );
        expiredTotal += (legacyRes as any).modifiedCount || 0;
      } catch {}

      return { expired: expiredTotal };
    } catch (error) {
      console.error("Error expiring old test drives:", error);
      return { expired: 0 };
    }
  }

  /**
   * Enhanced analytics (embedded + legacy)
   */
  static async getMobilAnalyticsEnhanced(
    year?: number,
    month?: number
  ): Promise<any[]> {
    try {
      await connectMongo();

      const matchCondition: any = {};
      if (year || month) {
        const dateFilter: any = {};
        if (year) {
          dateFilter.$gte = new Date(year, month ? month - 1 : 0, 1);
          dateFilter.$lt = new Date(year, month ? month : 12, 1);
        }
        matchCondition.createdAt = dateFilter;
      }

      const [embeddedAnalytics, legacyAnalytics] = await Promise.all([
        this.getEmbeddedAnalytics(matchCondition),
        this.getLegacyAnalytics(matchCondition),
      ]);

      return this.mergeAnalyticsData(embeddedAnalytics, legacyAnalytics);
    } catch (error) {
      console.error("Error getting enhanced analytics:", error);
      return [];
    }
  }

  private static async getEmbeddedAnalytics(_: any): Promise<any[]> {
    try {
      return await Mobil.aggregate([
        {
          $project: {
            merek: 1,
            tipe: 1,
            tahun: 1,
            noPol: 1,
            harga: 1,
            viewCount: {
              $ifNull: [
                { $size: { $ifNull: ["$interactions.viewDetails", []] } },
                0,
              ],
            },
            creditSimulationCount: {
              $ifNull: [
                { $size: { $ifNull: ["$interactions.simulasiKredit", []] } },
                0,
              ],
            },
            cashOfferCount: {
              $ifNull: [
                { $size: { $ifNull: ["$interactions.beliCash", []] } },
                0,
              ],
            },
            testDriveCount: {
              $ifNull: [
                { $size: { $ifNull: ["$interactions.testDrives", []] } },
                0,
              ],
            },
          },
        },
      ]);
    } catch (error) {
      console.error("Error getting embedded analytics:", error);
      return [];
    }
  }

  private static async getLegacyAnalytics(matchCondition: any): Promise<any[]> {
    try {
      return await ActivityLog.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: "$mobilId",
            viewCount: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "view_detail"] }, 1, 0],
              },
            },
            creditSimulationCount: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "simulasi_kredit"] }, 1, 0],
              },
            },
            cashOfferCount: {
              $sum: { $cond: [{ $eq: ["$activityType", "beli_cash"] }, 1, 0] },
            },
            testDriveCount: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "booking_test_drive"] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: "mobils",
            localField: "_id",
            foreignField: "_id",
            as: "mobil",
          },
        },
        { $unwind: "$mobil" },
        {
          $project: {
            _id: "$mobil._id",
            merek: "$mobil.merek",
            tipe: "$mobil.tipe",
            tahun: "$mobil.tahun",
            noPol: "$mobil.noPol",
            harga: "$mobil.harga",
            viewCount: 1,
            creditSimulationCount: 1,
            cashOfferCount: 1,
            testDriveCount: 1,
          },
        },
      ]);
    } catch (error) {
      console.error("Error getting legacy analytics:", error);
      return [];
    }
  }

  private static mergeAnalyticsData(embedded: any[], legacy: any[]): any[] {
    const merged = new Map<string, any>();
    legacy.forEach((item) => merged.set(item._id.toString(), item));
    embedded.forEach((item) => {
      const key = item._id.toString?.() ?? String(item._id);
      if (merged.has(key)) {
        const ex = merged.get(key);
        merged.set(key, {
          ...ex,
          viewCount: (ex.viewCount || 0) + (item.viewCount || 0),
          creditSimulationCount:
            (ex.creditSimulationCount || 0) + (item.creditSimulationCount || 0),
          cashOfferCount: (ex.cashOfferCount || 0) + (item.cashOfferCount || 0),
          testDriveCount: (ex.testDriveCount || 0) + (item.testDriveCount || 0),
        });
      } else {
        merged.set(key, item);
      }
    });
    return Array.from(merged.values());
  }

  /**
   * Dashboard stats
   */
  static async getDashboardStats(): Promise<any> {
    try {
      await connectMongo();
      const [customerStats, mobilStats, offerStats] = await Promise.all([
        this.getCustomerStats(),
        this.getMobilStats(),
        this.getCashOfferStats(),
      ]);
      return {
        customers: customerStats,
        mobils: mobilStats,
        offers: offerStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return null;
    }
  }

  private static async getCustomerStats(): Promise<any> {
    const customers = await Pelanggan.find({});
    const stats: any = {
      total: customers.length,
      byStatus: {},
      hotLeads: customers.filter((c: any) => c.status === "Hot Lead").length,
      interested: customers.filter((c: any) => c.status === "Interested")
        .length,
      readyForFollowUp: customers.filter((c: any) =>
        BusinessLogic.isReadyForFollowUp(
          c.interactionHistory || [],
          c.lastActivity,
          c.status
        )
      ).length,
    };
    const statusCounts = customers.reduce(
      (acc: any, c: any) => ((acc[c.status] = (acc[c.status] || 0) + 1), acc),
      {}
    );
    stats.byStatus = statusCounts;
    return stats;
  }

  private static async getMobilStats(): Promise<any> {
    const mobils = await Mobil.find({});
    return {
      total: mobils.length,
      available: mobils.filter((m: any) => m.status === "tersedia").length,
      sold: mobils.filter((m: any) => m.status === "terjual").length,
      withInteractions: mobils.filter(
        (m: any) =>
          m.interactions &&
          ((m.interactions.testDrives &&
            m.interactions.testDrives.length > 0) ||
            (m.interactions.beliCash && m.interactions.beliCash.length > 0) ||
            (m.interactions.simulasiKredit &&
              m.interactions.simulasiKredit.length > 0))
      ).length,
    };
  }

  private static async getCashOfferStats(): Promise<any> {
    const offers = await this.getPendingCashOffers(); // note: saat ini return semua; sesuaikan bila perlu
    if (offers.length === 0)
      return { total: 0, totalValue: 0, averageDiscount: 0 };

    const totalValue = offers.reduce(
      (sum: number, o: any) => sum + (o.hargaTawaran || 0),
      0
    );
    const averageDiscount =
      offers.reduce(
        (sum: number, o: any) => sum + (o.persentaseDiskon || 0),
        0
      ) / offers.length;

    return {
      total: offers.length,
      totalValue,
      averageDiscount: Math.round(averageDiscount * 100) / 100,
    };
  }

  /**
   * LEGACY compatibility helpers
   */
  static async getMobilAnalytics(year?: number, month?: number) {
    try {
      await connectMongo();

      const matchCondition: any = {};
      if (year || month) {
        const dateFilter: any = {};
        if (year) {
          dateFilter.$gte = new Date(year, month ? month - 1 : 0, 1);
          dateFilter.$lt = new Date(year, month ? month : 12, 1);
        }
        matchCondition.createdAt = dateFilter;
      }

      const enhanced = await this.getMobilAnalyticsEnhanced(year, month);
      return enhanced.map((item: any) => ({
        _id: item._id,
        merek: item.merek,
        tipe: item.tipe,
        tahun: item.tahun,
        noPol: item.noPol,
        activities: [
          { type: "view_detail", count: item.viewCount || 0 },
          { type: "simulasi_kredit", count: item.creditSimulationCount || 0 },
          { type: "beli_cash", count: item.cashOfferCount || 0 },
          { type: "booking_test_drive", count: item.testDriveCount || 0 },
        ],
        totalInteractions:
          (item.viewCount || 0) +
          (item.creditSimulationCount || 0) +
          (item.cashOfferCount || 0) +
          (item.testDriveCount || 0),
      }));
    } catch (error) {
      console.error("Error in getMobilAnalytics (legacy):", error);
      return [];
    }
  }

  static async getTopMobilsByActivity(
    activityType: string,
    limit: number = 10,
    year?: number,
    month?: number
  ) {
    try {
      const analyticsData = await this.getMobilAnalyticsEnhanced(year, month);
      const fieldMap: Record<string, string> = {
        view_detail: "viewCount",
        simulasi_kredit: "creditSimulationCount",
        beli_cash: "cashOfferCount",
        booking_test_drive: "testDriveCount",
      };
      const field = fieldMap[activityType] || "viewCount";

      return analyticsData
        .filter((i: any) => (i[field] || 0) > 0)
        .sort((a: any, b: any) => (b[field] || 0) - (a[field] || 0))
        .slice(0, limit)
        .map((i: any) => ({
          ...i,
          count: i[field] || 0,
          lastActivity: new Date().toISOString(),
        }));
    } catch (error) {
      console.error("Error getting top mobils by activity:", error);
      return [];
    }
  }

  static formatWhatsappNumber(number: string): string {
    return BusinessLogic.formatWhatsappNumber(number);
  }

  static async saveCustomerActivity_Legacy(data: CustomerActivityData) {
    const result = await this.saveCustomerActivity(data);
    return {
      success: result.success,
      pelangganId: result.pelangganId,
      error: result.error,
    };
  }

  static async getCustomerByPhone(noHp: string): Promise<any> {
    try {
      await connectMongo();

      const formattedHp = BusinessLogic.formatWhatsappNumber(noHp);
      const customer: any = await Pelanggan.findOne({
        noHp: formattedHp,
      }).populate(
        "summaryStats.mobilsFavorite",
        "merek tipe tahun noPol harga"
      );

      if (!customer) return null;

      return {
        ...customer.toObject(),
        priority: BusinessLogic.getCustomerPriority(
          customer.summaryStats || {},
          customer.lastActivity,
          customer.status
        ),
        engagementScore: BusinessLogic.calculateEngagementScore(
          customer.interactionHistory || []
        ),
      };
    } catch (error) {
      console.error("Error getting customer by phone:", error);
      return null;
    }
  }

  static async updateCustomerFollowUp(
    customerId: string,
    status: "Sudah Di Follow Up" | "Belum Di Follow Up"
  ): Promise<{ success: boolean; message: string }> {
    try {
      await connectMongo();

      const customer = await Pelanggan.findByIdAndUpdate(
        customerId,
        { status, lastActivity: new Date() },
        { new: true }
      );
      if (!customer) return { success: false, message: "Customer not found" };

      return { success: true, message: `Customer status updated to ${status}` };
    } catch (error) {
      console.error("Error updating customer follow up:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getCustomersWithPagination(
    page: number = 1,
    limit: number = 15,
    search?: string,
    statusFilter?: string
  ): Promise<{
    success: boolean;
    data: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      await connectMongo();

      const query: any = {};
      if (search)
        query.$or = [
          { nama: { $regex: search, $options: "i" } },
          { noHp: { $regex: search, $options: "i" } },
        ];
      if (statusFilter) query.status = statusFilter;

      const totalItems = await Pelanggan.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (page - 1) * limit;

      const customers = await Pelanggan.find(query)
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(limit);

      return {
        success: true,
        data: customers,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error getting customers with pagination:", error);
      return {
        success: false,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  static async broadcastMessage(
    message: string,
    targetStatus: string = "all"
  ): Promise<{ success: boolean; totalRecipients: number; results: any[] }> {
    try {
      await connectMongo();

      const query: any = {};
      if (targetStatus !== "all") query.status = targetStatus;

      const customers = await Pelanggan.find(query, {
        _id: 1,
        nama: 1,
        noHp: 1,
        status: 1,
      });

      const results = customers.map((c: any) => ({
        customerId: c._id,
        nama: c.nama,
        noHp: c.noHp,
        status: "scheduled",
        message,
        timestamp: new Date().toISOString(),
      }));

      return { success: true, totalRecipients: customers.length, results };
    } catch (error) {
      console.error("Error broadcasting message:", error);
      return { success: false, totalRecipients: 0, results: [] };
    }
  }

  static async getCustomerInteractionSummary(customerId: string): Promise<any> {
    try {
      await connectMongo();

      const customer: any = await Pelanggan.findById(customerId);
      if (!customer) return null;

      const embeddedCounts = {
        totalViews: customer.summaryStats?.totalViews || 0,
        totalTestDrives: customer.summaryStats?.totalTestDrives || 0,
        totalSimulasiKredit: customer.summaryStats?.totalSimulasiKredit || 0,
        totalTawaranCash: customer.summaryStats?.totalTawaranCash || 0,
      };

      const legacyCounts = await ActivityLog.aggregate([
        { $match: { pelangganId: customer._id } },
        {
          $group: {
            _id: null,
            viewDetails: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "view_detail"] }, 1, 0],
              },
            },
            simulasiKredit: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "simulasi_kredit"] }, 1, 0],
              },
            },
            beliCash: {
              $sum: { $cond: [{ $eq: ["$activityType", "beli_cash"] }, 1, 0] },
            },
            testDrives: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "booking_test_drive"] }, 1, 0],
              },
            },
          },
        },
      ]);

      const legacy = legacyCounts[0] || {
        viewDetails: 0,
        simulasiKredit: 0,
        beliCash: 0,
        testDrives: 0,
      };

      const totalCounts = {
        totalViews: embeddedCounts.totalViews + legacy.viewDetails,
        totalTestDrives: embeddedCounts.totalTestDrives + legacy.testDrives,
        totalSimulasiKredit:
          embeddedCounts.totalSimulasiKredit + legacy.simulasiKredit,
        totalTawaranCash: embeddedCounts.totalTawaranCash + legacy.beliCash,
      };

      return {
        customerId,
        customerName: customer.nama,
        customerPhone: customer.noHp,
        status: customer.status,
        ...totalCounts,
        totalInteractions: customer.totalInteractions,
        lastActivity: customer.lastActivity,
        engagementScore: BusinessLogic.calculateEngagementScore(
          customer.interactionHistory || []
        ),
        priority: BusinessLogic.getCustomerPriority(
          customer.summaryStats || {},
          customer.lastActivity,
          customer.status
        ),
      };
    } catch (error) {
      console.error("Error getting customer interaction summary:", error);
      return null;
    }
  }

  static async getRecentCustomerActivities(limit: number = 50): Promise<any[]> {
    try {
      await connectMongo();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activities = await ActivityLog.find({
        createdAt: { $gte: thirtyDaysAgo },
      })
        .populate("pelangganId", "nama noHp status")
        .populate("mobilId", "merek tipe tahun noPol harga")
        .sort({ createdAt: -1 })
        .limit(limit);

      return activities.map((a: any) => ({
        _id: a._id,
        customer: a.pelangganId,
        mobil: a.mobilId,
        activityType: a.activityType,
        additionalData: a.additionalData,
        timestamp: a.createdAt,
      }));
    } catch (error) {
      console.error("Error getting recent customer activities:", error);
      return [];
    }
  }

  static async getPerformanceMetrics(): Promise<any> {
    try {
      const [dashboardStats, recentActivities] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentCustomerActivities(10),
      ]);

      const thisMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const [thisMonthData, lastMonthData] = await Promise.all([
        this.getMobilAnalyticsEnhanced(
          thisMonth.getFullYear(),
          thisMonth.getMonth() + 1
        ),
        this.getMobilAnalyticsEnhanced(
          lastMonth.getFullYear(),
          lastMonth.getMonth() + 1
        ),
      ]);

      const sumCounts = (arr: any[]) =>
        arr.reduce(
          (sum, i) =>
            sum +
            (i.viewCount || 0) +
            (i.creditSimulationCount || 0) +
            (i.cashOfferCount || 0) +
            (i.testDriveCount || 0),
          0
        );

      const thisMonthTotal = sumCounts(thisMonthData);
      const lastMonthTotal = sumCounts(lastMonthData);

      const growthPercentage =
        lastMonthTotal > 0
          ? Math.round(
              ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
            )
          : 0;

      return {
        ...dashboardStats,
        performance: {
          thisMonthTotal,
          lastMonthTotal,
          growthPercentage,
          trend: growthPercentage >= 0 ? "up" : "down",
        },
        recentActivities,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting performance metrics:", error);
      return null;
    }
  }
}
