// src/types/mobil.ts - COMPLETE WITH ALL TYPES
export type MobilType = {
  _id: string;
  merek: string;
  tipe: string;
  tahun: number; // Changed from string to number to match schema
  warna: string;
  noPol: string;
  dp: number;
  status: string;
  transmisi: string;
  noRangka: string;
  noMesin: string;
  kapasitas_mesin: number;
  bahan_bakar: string;
  pajak: string;
  kilometer: number;
  fotos: string[]; // Changed from [string] to string[] for proper array type
  angsuran_4_thn: number;
  angsuran_5_tahun: number;
  STNK: string;
  BPKB: string;
  Faktur: string;
  harga: number;
  deskripsi: string;
  createdAt?: Date;
  updatedAt?: Date;

  // ✨ NEW EMBEDDED INTERACTIONS
  interactions?: {
    testDrives: TestDriveInteraction[];
    beliCash: BeliCashInteraction[];
    simulasiKredit: SimulasiKreditInteraction[];
  };
};

// Test Drive Interaction Type
export type TestDriveInteraction = {
  _id: string;
  pelangganId: string;
  namaCustomer: string;
  noHp: string;
  tanggalTest: Date;
  waktu: string;
  status: "active" | "completed" | "expired" | "cancelled";
  createdAt: Date;
  notes: string;
};

// Cash Offer Interaction Type
export type BeliCashInteraction = {
  _id: string;
  pelangganId: string;
  customerName: string;
  customerPhone: string;
  hargaTawaran: number;
  hargaAsli: number;
  selisihHarga: number;
  persentaseDiskon: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  timestamp: Date;
  notes: string;
};

// Credit Simulation Interaction Type
export type SimulasiKreditInteraction = {
  _id: string;
  pelangganId: string;
  customerName: string;
  customerPhone: string;
  dp: number;
  tenor: string;
  angsuran: number;
  timestamp: Date;
};

// Enhanced Customer Type
export type PelangganType = {
  _id: string;
  nama: string;
  noHp: string;
  status:
    | "Belum Di Follow Up"
    | "Sudah Di Follow Up"
    | "Interested"
    | "Hot Lead"
    | "Purchased";
  lastActivity: Date;
  totalInteractions: number;
  createdAt: Date;
  updatedAt: Date;

  // ✨ NEW DETAILED INTERACTION HISTORY
  interactionHistory: InteractionHistoryItem[];

  // ✨ NEW SUMMARY STATISTICS
  summaryStats: {
    totalViews: number;
    totalTestDrives: number;
    totalSimulasiKredit: number;
    totalTawaranCash: number;
    mobilsFavorite: string[]; // Array of mobil IDs
    averageOfferDiscount: number;
    preferredPriceRange: {
      min: number;
      max: number;
    };
  };

  // Enhanced fields (calculated)
  priority?: "low" | "medium" | "high" | "urgent";
  engagementScore?: number;
  readyForFollowUp?: boolean;
};

// Interaction History Item Type
export type InteractionHistoryItem = {
  _id: string;
  mobilId: string;
  mobilInfo: {
    merek: string;
    tipe: string;
    tahun: number;
    noPol: string;
    harga: number;
  };
  activityType: "view_detail" | "test_drive" | "simulasi_kredit" | "beli_cash";
  details: {
    // For view_detail
    duration?: number;
    userAgent?: string;
    referrer?: string;

    // For test_drive
    tanggalTest?: Date;
    waktu?: string;
    status?: string;

    // For simulasi_kredit
    dp?: number;
    tenor?: string;
    angsuran?: number;

    // For beli_cash
    hargaTawaran?: number;
    selisihHarga?: number;
    persentaseDiskon?: number;

    // General
    notes?: string;
  };
  timestamp: Date;
};

// Test Drive Booking with Mobil Info
export type TestDriveBookingWithMobil = {
  _id: string;
  namaCustomer: string;
  noHp: string;
  tanggalTest: Date;
  waktu: string;
  status: "active" | "completed" | "expired" | "cancelled";
  createdAt: Date;
  notes: string;
  mobil: {
    _id: string;
    merek: string;
    tipe: string;
    tahun: number;
    noPol: string;
    harga: number;
  };
  source: "embedded" | "legacy"; // Track data source for hybrid approach
};

// Cash Offer with Mobil Info
export type CashOfferWithMobil = {
  _id: string;
  customerName: string;
  customerPhone: string;
  hargaTawaran: number;
  hargaAsli: number;
  selisihHarga: number;
  persentaseDiskon: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  timestamp: Date;
  notes: string;
  mobil: {
    _id: string;
    merek: string;
    tipe: string;
    tahun: number;
    noPol: string;
    harga: number;
  };
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  validation?: any;
  stats?: any;
  meta?: any;
};

// Customer Activity Request Type
export type CustomerActivityRequest = {
  nama: string;
  noHp: string;
  mobilId: string;
  activityType:
    | "view_detail"
    | "beli_cash"
    | "simulasi_kredit"
    | "booking_test_drive";
  additionalData?: {
    // For test drive
    tanggalTest?: string;
    waktu?: string;

    // For credit simulation
    dp?: number;
    tenorCicilan?: string;
    angsuran?: number;

    // For cash offer
    hargaTawaran?: number;

    // General
    notes?: string;
  };
};

// Dashboard Stats Types
export type CustomerStats = {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  readyForFollowUp: number;
  averageEngagement: number;
};

export type TestDriveStats = {
  total: number;
  active: number;
  completed: number;
  expired: number;
  cancelled: number;
};

export type CashOfferStats = {
  total: number;
  totalValue: number;
  averageDiscount: number;
  potentialRevenue: number;
  potentialLoss: number;
  byDiscountRange: Record<string, number>;
};

// Analytics Types
export type MobilAnalyticsItem = {
  _id: string;
  merek: string;
  tipe: string;
  tahun: number;
  noPol: string;
  harga: number;
  viewCount: number;
  creditSimulationCount: number;
  cashOfferCount: number;
  testDriveCount: number;
  performanceScore: number;
  engagementRate: number;
};

export type TopPerformers = {
  mostViewed: MobilAnalyticsItem[];
  mostInquired: MobilAnalyticsItem[];
  bestConversion: MobilAnalyticsItem[];
  hotProspects: MobilAnalyticsItem[];
};

export type CustomerJourneyStage = {
  stage: string;
  count: number;
  description: string;
};

export type ConversionRate = {
  name: string;
  value: number;
};

export type CustomerSegment = {
  _id: string;
  status: string;
  count: number;
  avgInteractions: number;
};

export type JourneyInsight = {
  type: "success" | "warning" | "alert" | "info";
  title: string;
  message: string;
  actionable: string;
};

export type RevenueProjection = {
  month: string;
  monthNumber: number;
  year: number;
  actual?: number;
  projected?: number;
  isHistorical: boolean;
  confidence: number;
  breakdown?: {
    newCustomers: number;
    repeatInquiries: number;
    pipelineConversion: number;
    estimatedSales: number;
    avgDealSize: number;
    confidenceFactors: {
      seasonality: number;
      historicalData: number;
      pipelineQuality: number;
    };
  };
};

export type PipelineValue = {
  pendingOffers: number;
  hotLeads: number;
  total: number;
};

// Business Logic Types
export type CashOfferValidation = {
  isValid: boolean;
  minAcceptable: number;
  discount: number;
  discountPercentage: number;
  errorMessage?: string;
};

export type StatusUpdateResult = {
  newStatus: string;
  shouldUpdate: boolean;
  reason: string;
};

// Form Types (for integration)
export type BroadcastMessageRequest = {
  message: string;
  targetStatus: string;
};

export type BroadcastResult = {
  success: boolean;
  totalRecipients: number;
  results: Array<{
    customerId: string;
    nama: string;
    noHp: string;
    status: string;
    message: string;
  }>;
};

// Dashboard Integration Types
export type DashboardFilters = {
  search?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type DashboardMeta = {
  page?: number;
  limit?: number;
  total?: number;
  filters?: DashboardFilters;
  timestamp: string;
};
