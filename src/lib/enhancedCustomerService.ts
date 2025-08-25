// src/lib/enhancedCustomerService.ts - COMPLETE FIXED VERSION
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

      // Format nomor HP
      const formattedHp = BusinessLogic.formatWhatsappNumber(data.noHp);

      // Get mobil info for embedding
      const mobil = await Mobil.findById(data.mobilId);
      if (!mobil) {
        return {
          success: false,
          error: "Mobil not found",
        };
      }

      // Validate cash offer if applicable
      let validation = null;
      if (
        data.activityType === "beli_cash" &&
        data.additionalData?.hargaTawaran
      ) {
        validation = BusinessLogic.validateCashOffer(
          mobil.harga,
          data.additionalData.hargaTawaran
        );

        if (!validation.isValid) {
          return {
            success: false,
            error: validation.errorMessage,
            validation,
          };
        }
      }

      // Find or create customer
      let pelanggan = await Pelanggan.findOne({ noHp: formattedHp });

      if (!pelanggan) {
        // Create new customer
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
        // Update existing customer
        pelanggan.nama = data.nama.trim();
        pelanggan.lastActivity = new Date();
        pelanggan.totalInteractions += 1;
      }

      // Determine new status
      const statusUpdate = BusinessLogic.updateCustomerStatus(
        data.activityType,
        pelanggan.status
      );

      if (statusUpdate.shouldUpdate) {
        pelanggan.status = statusUpdate.newStatus;
      }

      // Add to interaction history (NEW EMBEDDED DATA)
      const interactionDetails = this.buildInteractionDetails(data);

      // Ensure interactionHistory exists
      if (!pelanggan.interactionHistory) {
        pelanggan.interactionHistory = [];
      }

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

      // Update summary stats safely
      if (typeof pelanggan.updateSummaryStats === "function") {
        pelanggan.updateSummaryStats();
      }

      // Save customer
      await pelanggan.save();

      // Add to mobil embedded interactions (NEW EMBEDDED DATA)
      await this.addMobilInteraction(
        mobil._id,
        pelanggan._id,
        data,
        validation
      );

      // Also save to ActivityLog for backward compatibility and analytics
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
                hargaAsli: validation.minAcceptable + validation.discount,
                selisihHarga: validation.discount,
                persentaseDiskon: validation.discountPercentage,
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
      // Don't throw error - this is not critical for the main flow
    }
  }

  /**
   * Build interaction details for different activity types
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
        return {
          hargaTawaran: base.hargaTawaran || 0,
          status: "pending",
        };

      default:
        return base;
    }
  }

  /**
   * Get customer with interaction history (HYBRID - reads from both sources)
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

      // Also get data from old ActivityLog as fallback
      const oldActivities = await ActivityLog.find({ pelangganId })
        .populate("mobilId", "merek tipe tahun noPol harga")
        .sort({ createdAt: -1 });

      return {
        ...pelanggan.toObject(),
        fallbackActivities: oldActivities, // For compatibility
      };
    } catch (error) {
      console.error("Error getting customer history:", error);
      return null;
    }
  }

  /**
   * Get all test drive bookings (HYBRID - reads from both sources)
   */
  static async getAllTestDriveBookings(): Promise<any[]> {
    try {
      await connectMongo();

      const bookings = [];

      // Get from new embedded structure
      const mobilsWithBookings = await Mobil.find(
        { "interactions.testDrives": { $exists: true, $ne: [] } },
        {
          merek: 1,
          tipe: 1,
          tahun: 1,
          noPol: 1,
          harga: 1,
          "interactions.testDrives": 1,
        }
      );

      mobilsWithBookings.forEach((mobil) => {
        if (mobil.interactions?.testDrives) {
          mobil.interactions.testDrives.forEach((booking) => {
            bookings.push({
              _id: booking._id,
              namaCustomer: booking.namaCustomer,
              noHp: booking.noHp,
              tanggalTest: booking.tanggalTest,
              waktu: booking.waktu || "10:00 - 11:00",
              status: booking.status,
              createdAt: booking.createdAt,
              notes: booking.notes || "",
              mobil: {
                _id: mobil._id,
                merek: mobil.merek,
                tipe: mobil.tipe,
                tahun: mobil.tahun,
                noPol: mobil.noPol,
                harga: mobil.harga,
              },
              source: "embedded",
            });
          });
        }
      });

      // Get from old TestDriveBooking collection as fallback
      try {
        const oldBookings = await TestDriveBooking.find({})
          .populate("mobilId", "merek tipe tahun noPol harga")
          .sort({ createdAt: -1 });

        oldBookings.forEach((booking) => {
          if (booking.mobilId) {
            bookings.push({
              _id: booking._id,
              namaCustomer: booking.namaCustomer,
              noHp: booking.noHp,
              tanggalTest: booking.tanggalTest,
              waktu: "10:00 - 11:00", // Default for old data
              status: new Date() > booking.tanggalTest ? "expired" : "active",
              createdAt: booking.createdAt,
              notes: "",
              mobil: booking.mobilId,
              source: "legacy",
            });
          }
        });
      } catch (error) {
        console.log("Old test drive bookings not available:", error);
      }

      return bookings.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("Error getting test drive bookings:", error);
      return [];
    }
  }

  /**
   * Get all customers with enhanced data (HYBRID)
   */
  static async getAllCustomersWithStats(): Promise<any[]> {
    try {
      await connectMongo();

      const customers = await Pelanggan.find({})
        .populate("summaryStats.mobilsFavorite", "merek tipe tahun noPol harga")
        .sort({ lastActivity: -1 });

      // Enhance each customer with priority and engagement score
      const enhancedCustomers = customers.map((customer) => {
        const customerObj = customer.toObject();

        return {
          ...customerObj,
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

      return enhancedCustomers;
    } catch (error) {
      console.error("Error getting customers with stats:", error);
      return [];
    }
  }

  /**
   * Get pending cash offers across all mobils
   */
  static async getPendingCashOffers(): Promise<any[]> {
    try {
      await connectMongo();

      const offers = [];

      const mobilsWithOffers = await Mobil.find(
        { "interactions.beliCash": { $exists: true, $ne: [] } },
        {
          merek: 1,
          tipe: 1,
          tahun: 1,
          noPol: 1,
          harga: 1,
          "interactions.beliCash": 1,
        }
      );

      mobilsWithOffers.forEach((mobil) => {
        if (mobil.interactions?.beliCash) {
          mobil.interactions.beliCash
            .filter((offer) => offer.status === "pending")
            .forEach((offer) => {
              offers.push({
                _id: offer._id,
                customerName: offer.customerName,
                customerPhone: offer.customerPhone,
                hargaTawaran: offer.hargaTawaran,
                hargaAsli: offer.hargaAsli,
                selisihHarga: offer.selisihHarga,
                persentaseDiskon: offer.persentaseDiskon,
                timestamp: offer.timestamp,
                notes: offer.notes || "",
                mobil: {
                  _id: mobil._id,
                  merek: mobil.merek,
                  tipe: mobil.tipe,
                  tahun: mobil.tahun,
                  noPol: mobil.noPol,
                  harga: mobil.harga,
                },
              });
            });
        }
      });

      return offers.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Error getting pending cash offers:", error);
      return [];
    }
  }

  /**
   * Update cash offer status
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
        {
          _id: mobilId,
          "interactions.beliCash._id": offerId,
        },
        {
          $set: {
            "interactions.beliCash.$.status": status,
            "interactions.beliCash.$.notes": notes || "",
            "interactions.beliCash.$.updatedAt": new Date(),
          },
        }
      );

      if (result.modifiedCount > 0) {
        return {
          success: true,
          message: `Cash offer ${status} successfully`,
        };
      } else {
        return {
          success: false,
          message: "Cash offer not found or already updated",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update test drive status
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
        {
          _id: mobilId,
          "interactions.testDrives._id": bookingId,
        },
        {
          $set: {
            "interactions.testDrives.$.status": status,
            "interactions.testDrives.$.notes": notes || "",
            "interactions.testDrives.$.updatedAt": new Date(),
          },
        }
      );

      if (result.modifiedCount > 0) {
        return {
          success: true,
          message: `Test drive ${status} successfully`,
        };
      } else {
        return {
          success: false,
          message: "Test drive booking not found or already updated",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Auto-expire old test drive bookings
   */
  static async expireOldTestDrives(): Promise<{ expired: number }> {
    try {
      await connectMongo();

      const expiredTime = BusinessLogic.checkExpiredBookings();

      const result = await Mobil.updateMany(
        {
          "interactions.testDrives": {
            $elemMatch: {
              status: "active",
              tanggalTest: { $lt: expiredTime },
            },
          },
        },
        {
          $set: {
            "interactions.testDrives.$[elem].status": "expired",
          },
        },
        {
          arrayFilters: [
            {
              "elem.status": "active",
              "elem.tanggalTest": { $lt: expiredTime },
            },
          ],
        }
      );

      return { expired: result.modifiedCount };
    } catch (error) {
      console.error("Error expiring old test drives:", error);
      return { expired: 0 };
    }
  }

  /**
   * Get mobil analytics with embedded interactions
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

      // Get analytics from both embedded data and ActivityLogs
      const [embeddedAnalytics, legacyAnalytics] = await Promise.all([
        this.getEmbeddedAnalytics(matchCondition),
        this.getLegacyAnalytics(matchCondition),
      ]);

      // Merge analytics data
      return this.mergeAnalyticsData(embeddedAnalytics, legacyAnalytics);
    } catch (error) {
      console.error("Error getting enhanced analytics:", error);
      return [];
    }
  }

  private static async getEmbeddedAnalytics(
    matchCondition: any
  ): Promise<any[]> {
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
    const merged = new Map();

    // Add legacy data
    legacy.forEach((item) => {
      merged.set(item._id.toString(), item);
    });

    // Merge with embedded data
    embedded.forEach((item) => {
      const key = item._id.toString();
      if (merged.has(key)) {
        const existing = merged.get(key);
        merged.set(key, {
          ...existing,
          viewCount: existing.viewCount + item.viewCount,
          creditSimulationCount:
            existing.creditSimulationCount + item.creditSimulationCount,
          cashOfferCount: existing.cashOfferCount + item.cashOfferCount,
          testDriveCount: existing.testDriveCount + item.testDriveCount,
        });
      } else {
        merged.set(key, item);
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Get analytics data for dashboard stats
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

    const stats = {
      total: customers.length,
      byStatus: {},
      hotLeads: customers.filter((c) => c.status === "Hot Lead").length,
      interested: customers.filter((c) => c.status === "Interested").length,
      readyForFollowUp: customers.filter((c) =>
        BusinessLogic.isReadyForFollowUp(
          c.interactionHistory || [],
          c.lastActivity,
          c.status
        )
      ).length,
    };

    // Count by status
    const statusCounts = customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {});

    stats.byStatus = statusCounts;
    return stats;
  }

  private static async getMobilStats(): Promise<any> {
    const mobils = await Mobil.find({});

    return {
      total: mobils.length,
      available: mobils.filter((m) => m.status === "tersedia").length,
      sold: mobils.filter((m) => m.status === "terjual").length,
      withInteractions: mobils.filter(
        (m) =>
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
    const offers = await this.getPendingCashOffers();

    if (offers.length === 0) {
      return {
        total: 0,
        totalValue: 0,
        averageDiscount: 0,
      };
    }

    const totalValue = offers.reduce(
      (sum, offer) => sum + offer.hargaTawaran,
      0
    );
    const averageDiscount =
      offers.reduce((sum, offer) => sum + offer.persentaseDiskon, 0) /
      offers.length;

    return {
      total: offers.length,
      totalValue,
      averageDiscount: Math.round(averageDiscount * 100) / 100,
    };
  }

  /**
   * LEGACY COMPATIBILITY FUNCTIONS
   * These functions maintain compatibility with existing analytics code
   */

  /**
   * Get mobile analytics (original function for backward compatibility)
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

      // Use enhanced analytics but return in original format
      const enhancedData = await this.getMobilAnalyticsEnhanced(year, month);

      // Transform to original format for backward compatibility
      return enhancedData.map((item) => ({
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

  /**
   * Get top mobils by activity (original function for backward compatibility)
   */
  static async getTopMobilsByActivity(
    activityType: string,
    limit: number = 10,
    year?: number,
    month?: number
  ) {
    try {
      const analyticsData = await this.getMobilAnalyticsEnhanced(year, month);

      const fieldMap = {
        view_detail: "viewCount",
        simulasi_kredit: "creditSimulationCount",
        beli_cash: "cashOfferCount",
        booking_test_drive: "testDriveCount",
      };

      const fieldName = fieldMap[activityType] || "viewCount";

      return analyticsData
        .filter((item) => (item[fieldName] || 0) > 0)
        .sort((a, b) => (b[fieldName] || 0) - (a[fieldName] || 0))
        .slice(0, limit)
        .map((item) => ({
          ...item,
          count: item[fieldName] || 0,
          lastActivity: new Date().toISOString(), // Default value for compatibility
        }));
    } catch (error) {
      console.error("Error getting top mobils by activity:", error);
      return [];
    }
  }

  /**
   * Format WhatsApp number (original function for backward compatibility)
   */
  static formatWhatsappNumber(number: string): string {
    return BusinessLogic.formatWhatsappNumber(number);
  }

  /**
   * Save customer activity (original function for backward compatibility)
   */
  static async saveCustomerActivity_Legacy(data: CustomerActivityData) {
    const result = await this.saveCustomerActivity(data);

    // Return in original format for backward compatibility
    return {
      success: result.success,
      pelangganId: result.pelangganId,
      error: result.error,
    };
  }

  /**
   * Get customer by phone number
   */
  static async getCustomerByPhone(noHp: string): Promise<any> {
    try {
      await connectMongo();

      const formattedHp = BusinessLogic.formatWhatsappNumber(noHp);
      const customer = await Pelanggan.findOne({ noHp: formattedHp }).populate(
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

  /**
   * Update customer follow up status
   */
  static async updateCustomerFollowUp(
    customerId: string,
    status: "Sudah Di Follow Up" | "Belum Di Follow Up"
  ): Promise<{ success: boolean; message: string }> {
    try {
      await connectMongo();

      const customer = await Pelanggan.findByIdAndUpdate(
        customerId,
        {
          status,
          lastActivity: new Date(),
        },
        { new: true }
      );

      if (!customer) {
        return {
          success: false,
          message: "Customer not found",
        };
      }

      return {
        success: true,
        message: `Customer status updated to ${status}`,
      };
    } catch (error) {
      console.error("Error updating customer follow up:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get customers with pagination (for existing dashboard compatibility)
   */
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

      // Build query
      const query: any = {};

      if (search) {
        query.$or = [
          { nama: { $regex: search, $options: "i" } },
          { noHp: { $regex: search, $options: "i" } },
        ];
      }

      if (statusFilter) {
        query.status = statusFilter;
      }

      // Get total count
      const totalItems = await Pelanggan.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);
      const skip = (page - 1) * limit;

      // Get customers
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

  /**
   * Broadcast message to customers
   */
  static async broadcastMessage(
    message: string,
    targetStatus: string = "all"
  ): Promise<{
    success: boolean;
    totalRecipients: number;
    results: any[];
  }> {
    try {
      await connectMongo();

      // Build query for target customers
      const query: any = {};
      if (targetStatus !== "all") {
        query.status = targetStatus;
      }

      const customers = await Pelanggan.find(query, {
        _id: 1,
        nama: 1,
        noHp: 1,
        status: 1,
      });

      // Simulate broadcast results (replace with actual WhatsApp API integration)
      const results = customers.map((customer) => ({
        customerId: customer._id,
        nama: customer.nama,
        noHp: customer.noHp,
        status: "scheduled", // In real implementation, this would be the actual send status
        message: message,
        timestamp: new Date().toISOString(),
      }));

      return {
        success: true,
        totalRecipients: customers.length,
        results,
      };
    } catch (error) {
      console.error("Error broadcasting message:", error);
      return {
        success: false,
        totalRecipients: 0,
        results: [],
      };
    }
  }

  /**
   * Get customer interaction summary
   */
  static async getCustomerInteractionSummary(customerId: string): Promise<any> {
    try {
      await connectMongo();

      const customer = await Pelanggan.findById(customerId);
      if (!customer) return null;

      // Get interaction counts from both embedded and legacy data
      const embeddedCounts = {
        totalViews: customer.summaryStats?.totalViews || 0,
        totalTestDrives: customer.summaryStats?.totalTestDrives || 0,
        totalSimulasiKredit: customer.summaryStats?.totalSimulasiKredit || 0,
        totalTawaranCash: customer.summaryStats?.totalTawaranCash || 0,
      };

      // Get legacy counts as fallback
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

      // Combine counts
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

  /**
   * Get recent customer activities (last 30 days)
   */
  static async getRecentCustomerActivities(limit: number = 50): Promise<any[]> {
    try {
      await connectMongo();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get recent activities from ActivityLog
      const activities = await ActivityLog.find({
        createdAt: { $gte: thirtyDaysAgo },
      })
        .populate("pelangganId", "nama noHp status")
        .populate("mobilId", "merek tipe tahun noPol harga")
        .sort({ createdAt: -1 })
        .limit(limit);

      return activities.map((activity) => ({
        _id: activity._id,
        customer: activity.pelangganId,
        mobil: activity.mobilId,
        activityType: activity.activityType,
        additionalData: activity.additionalData,
        timestamp: activity.createdAt,
      }));
    } catch (error) {
      console.error("Error getting recent customer activities:", error);
      return [];
    }
  }

  /**
   * Get performance metrics for dashboard
   */
  static async getPerformanceMetrics(): Promise<any> {
    try {
      const [dashboardStats, recentActivities] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentCustomerActivities(10),
      ]);

      const thisMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Get monthly comparison data
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

      const thisMonthTotal = thisMonthData.reduce(
        (sum, item) =>
          sum +
          (item.viewCount || 0) +
          (item.creditSimulationCount || 0) +
          (item.cashOfferCount || 0) +
          (item.testDriveCount || 0),
        0
      );

      const lastMonthTotal = lastMonthData.reduce(
        (sum, item) =>
          sum +
          (item.viewCount || 0) +
          (item.creditSimulationCount || 0) +
          (item.cashOfferCount || 0) +
          (item.testDriveCount || 0),
        0
      );

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
