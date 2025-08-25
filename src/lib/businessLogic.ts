// src/lib/businessLogic.ts
export interface CashOfferValidation {
  isValid: boolean;
  minAcceptable: number;
  discount: number;
  discountPercentage: number;
  errorMessage?: string;
}

export interface StatusUpdateResult {
  newStatus: string;
  shouldUpdate: boolean;
  reason: string;
}

export class BusinessLogic {
  /**
   * Validate cash offer - maksimal 9% diskon dari harga mobil
   */
  static validateCashOffer(
    hargaMobil: number,
    hargaTawaran: number
  ): CashOfferValidation {
    const maxDiscountPercentage = 9; // 9%
    const maxDiscount = hargaMobil * (maxDiscountPercentage / 100);
    const minAcceptableOffer = hargaMobil - maxDiscount;

    const discount = hargaMobil - hargaTawaran;
    const discountPercentage = (discount / hargaMobil) * 100;

    const isValid = hargaTawaran >= minAcceptableOffer;

    return {
      isValid,
      minAcceptable: Math.round(minAcceptableOffer),
      discount: Math.round(discount),
      discountPercentage: Math.round(discountPercentage * 100) / 100, // Round to 2 decimal places
      errorMessage: !isValid
        ? `Tawaran terlalu rendah. Minimum tawaran: Rp ${minAcceptableOffer.toLocaleString(
            "id-ID"
          )} (maksimal diskon ${maxDiscountPercentage}%)`
        : undefined,
    };
  }

  /**
   * Update customer status based on activity type
   */
  static updateCustomerStatus(
    activityType: string,
    currentStatus: string
  ): StatusUpdateResult {
    const statusPriority = {
      "Belum Di Follow Up": 1,
      "Sudah Di Follow Up": 2,
      Interested: 3,
      "Hot Lead": 4,
      Purchased: 5,
    };

    const activityStatusMap = {
      view_detail: currentStatus, // No change for views
      simulasi_kredit: "Interested",
      test_drive: "Hot Lead",
      beli_cash: "Hot Lead",
    };

    const suggestedStatus = activityStatusMap[activityType] || currentStatus;

    // Only update if new status has higher priority
    const currentPriority = statusPriority[currentStatus] || 1;
    const newPriority = statusPriority[suggestedStatus] || 1;

    const shouldUpdate = newPriority > currentPriority;

    return {
      newStatus: shouldUpdate ? suggestedStatus : currentStatus,
      shouldUpdate,
      reason: shouldUpdate
        ? `Status updated from "${currentStatus}" to "${suggestedStatus}" due to ${activityType}`
        : `Status remains "${currentStatus}" (already higher or equal priority)`,
    };
  }

  /**
   * Check for expired test drive bookings
   */
  static checkExpiredBookings(): Date {
    // Test drives expire after 24 hours
    const hoursToExpire = 24;
    const expiredTime = new Date(Date.now() - hoursToExpire * 60 * 60 * 1000);
    return expiredTime;
  }

  /**
   * Format WhatsApp number to international format
   */
  static formatWhatsappNumber(number: string): string {
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

  /**
   * Generate unique interaction ID for tracking
   */
  static generateInteractionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Calculate customer engagement score based on interactions
   */
  static calculateEngagementScore(interactionHistory: any[]): number {
    const weights = {
      view_detail: 1,
      simulasi_kredit: 3,
      test_drive: 5,
      beli_cash: 7,
    };

    const score = interactionHistory.reduce((total, interaction) => {
      const weight = weights[interaction.activityType] || 0;
      return total + weight;
    }, 0);

    // Normalize to 0-100 scale
    return Math.min(Math.round(score / 2), 100);
  }

  /**
   * Determine if customer is ready for follow-up
   */
  static isReadyForFollowUp(
    interactionHistory: any[],
    lastActivity: Date,
    currentStatus: string
  ): boolean {
    if (currentStatus === "Purchased") return false;

    const recentActivity = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const hasRecentActivity = new Date(lastActivity) > recentActivity;

    const hasHighValueActivity = interactionHistory.some((h) =>
      ["simulasi_kredit", "test_drive", "beli_cash"].includes(h.activityType)
    );

    const engagementScore = this.calculateEngagementScore(interactionHistory);

    return hasRecentActivity && hasHighValueActivity && engagementScore >= 10;
  }

  /**
   * Get customer priority level for sales team
   */
  static getCustomerPriority(
    summaryStats: any,
    lastActivity: Date,
    status: string
  ): "low" | "medium" | "high" | "urgent" {
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Urgent: Hot leads with recent cash offers or test drives
    if (status === "Hot Lead" && daysSinceLastActivity <= 2) {
      return "urgent";
    }

    // High: Multiple interactions with buying intent
    if (summaryStats.totalTawaranCash > 0 || summaryStats.totalTestDrives > 1) {
      return "high";
    }

    // Medium: Interested customers with credit simulations
    if (status === "Interested" && summaryStats.totalSimulasiKredit > 0) {
      return "medium";
    }

    // Low: New or basic interactions
    return "low";
  }
}
