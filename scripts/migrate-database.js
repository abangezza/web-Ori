// scripts/migrate-database-fixed.js - FIXED VERSION
const mongoose = require("mongoose");

// Load environment variables
require("dotenv").config();

console.log("🚀 Starting FIXED Database Migration...");
console.log("=====================================");

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
}

async function migratePelangganCollection() {
  console.log("\n📝 Migrating Pelanggan Collection...");

  try {
    const db = mongoose.connection.db;
    const collection = db.collection("pelanggans");

    // FIXED: Separate operations for different updates

    // 1. Add new fields to documents that don't have them
    const newFieldsResult = await collection.updateMany(
      {
        $or: [
          { interactionHistory: { $exists: false } },
          { summaryStats: { $exists: false } },
        ],
      },
      {
        $set: {
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
        },
      }
    );

    console.log(
      `✅ Added new fields to ${newFieldsResult.modifiedCount} Pelanggan documents`
    );

    // 2. FIXED: Fix invalid status values (don't use $addToSet on string field)
    const validStatuses = [
      "Belum Di Follow Up",
      "Sudah Di Follow Up",
      "Interested",
      "Hot Lead",
      "Purchased",
    ];

    const statusFixResult = await collection.updateMany(
      {
        status: { $nin: validStatuses },
      },
      {
        $set: { status: "Belum Di Follow Up" },
      }
    );

    console.log(
      `✅ Fixed ${statusFixResult.modifiedCount} invalid status values`
    );

    // 3. Add lastActivity to documents that don't have it
    const lastActivityResult = await collection.updateMany(
      { lastActivity: { $exists: false } },
      {
        $set: {
          lastActivity: new Date(),
        },
      }
    );

    console.log(
      `✅ Added lastActivity to ${lastActivityResult.modifiedCount} documents`
    );
  } catch (error) {
    console.error("❌ Pelanggan migration failed:", error.message);
  }
}

async function migrateMobilCollection() {
  console.log("\n🚗 Migrating Mobil Collection...");

  try {
    const db = mongoose.connection.db;
    const collection = db.collection("mobils");

    // Add interactions field to documents that don't have it
    const result = await collection.updateMany(
      { interactions: { $exists: false } },
      {
        $set: {
          interactions: {
            testDrives: [],
            beliCash: [],
            simulasiKredit: [],
          },
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} Mobil documents`);
  } catch (error) {
    console.error("❌ Mobil migration failed:", error.message);
  }
}

async function createIndexes() {
  console.log("\n📊 Creating Database Indexes...");

  try {
    const db = mongoose.connection.db;

    // FIXED: Handle existing indexes properly
    async function createIndexSafely(collection, indexSpec, options = {}) {
      const collectionObj = db.collection(collection);
      try {
        await collectionObj.createIndex(indexSpec, options);
        console.log(
          `✅ Created index on ${collection}: ${JSON.stringify(indexSpec)}`
        );
      } catch (error) {
        if (error.code === 85 || error.message.includes("already exists")) {
          console.log(
            `ℹ️  Index already exists on ${collection}: ${JSON.stringify(
              indexSpec
            )}`
          );
        } else {
          console.error(
            `❌ Failed to create index on ${collection}:`,
            error.message
          );
        }
      }
    }

    // Pelanggan indexes (handle existing unique index on noHp)
    await createIndexSafely("pelanggans", { status: 1 });
    await createIndexSafely("pelanggans", { lastActivity: -1 });
    await createIndexSafely("pelanggans", { totalInteractions: -1 });
    await createIndexSafely("pelanggans", {
      "interactionHistory.activityType": 1,
    });
    await createIndexSafely("pelanggans", {
      "interactionHistory.timestamp": -1,
    });
    console.log("✅ Pelanggan indexes processed");

    // Mobil indexes
    await createIndexSafely("mobils", { status: 1 });
    await createIndexSafely("mobils", { merek: 1, tipe: 1 });
    await createIndexSafely("mobils", { harga: 1 });
    await createIndexSafely("mobils", { "interactions.testDrives.status": 1 });
    await createIndexSafely("mobils", { "interactions.beliCash.status": 1 });
    console.log("✅ Mobil indexes processed");

    // ActivityLog indexes (existing)
    await createIndexSafely("activitylogs", { pelangganId: 1 });
    await createIndexSafely("activitylogs", { mobilId: 1 });
    await createIndexSafely("activitylogs", { activityType: 1 });
    await createIndexSafely("activitylogs", { createdAt: -1 });
    console.log("✅ ActivityLog indexes verified");
  } catch (error) {
    console.error("❌ Index creation failed:", error.message);
  }
}

async function validateMigration() {
  console.log("\n🔍 Validating Migration...");

  try {
    const db = mongoose.connection.db;

    // Count documents
    const pelangganCount = await db.collection("pelanggans").countDocuments();
    const mobilCount = await db.collection("mobils").countDocuments();
    const activityLogCount = await db
      .collection("activitylogs")
      .countDocuments();

    console.log(`📊 Database Status:`);
    console.log(`   - Pelanggans: ${pelangganCount}`);
    console.log(`   - Mobils: ${mobilCount}`);
    console.log(`   - ActivityLogs: ${activityLogCount}`);

    // Check new fields
    const pelangganWithNewFields = await db
      .collection("pelanggans")
      .countDocuments({
        interactionHistory: { $exists: true },
        summaryStats: { $exists: true },
      });

    const mobilWithNewFields = await db.collection("mobils").countDocuments({
      interactions: { $exists: true },
    });

    console.log(`📊 Migration Status:`);
    console.log(
      `   - Pelanggans with new fields: ${pelangganWithNewFields}/${pelangganCount}`
    );
    console.log(
      `   - Mobils with new fields: ${mobilWithNewFields}/${mobilCount}`
    );

    // Check specific field samples
    const samplePelanggan = await db.collection("pelanggans").findOne(
      { interactionHistory: { $exists: true } },
      {
        projection: {
          nama: 1,
          interactionHistory: 1,
          summaryStats: 1,
          status: 1,
        },
      }
    );

    if (samplePelanggan) {
      console.log(`📝 Sample Pelanggan Structure:`);
      console.log(`   - Name: ${samplePelanggan.nama}`);
      console.log(`   - Status: ${samplePelanggan.status}`);
      console.log(
        `   - InteractionHistory: ${
          Array.isArray(samplePelanggan.interactionHistory)
            ? "Array"
            : "Invalid"
        }`
      );
      console.log(
        `   - SummaryStats: ${
          samplePelanggan.summaryStats ? "Object" : "Missing"
        }`
      );
    }

    const sampleMobil = await db
      .collection("mobils")
      .findOne(
        { interactions: { $exists: true } },
        { projection: { merek: 1, tipe: 1, interactions: 1 } }
      );

    if (sampleMobil) {
      console.log(`📝 Sample Mobil Structure:`);
      console.log(`   - Car: ${sampleMobil.merek} ${sampleMobil.tipe}`);
      console.log(
        `   - TestDrives: ${
          Array.isArray(sampleMobil.interactions?.testDrives)
            ? "Array"
            : "Invalid"
        }`
      );
      console.log(
        `   - BeliCash: ${
          Array.isArray(sampleMobil.interactions?.beliCash)
            ? "Array"
            : "Invalid"
        }`
      );
      console.log(
        `   - SimulasiKredit: ${
          Array.isArray(sampleMobil.interactions?.simulasiKredit)
            ? "Array"
            : "Invalid"
        }`
      );
    }

    const isComplete =
      pelangganWithNewFields === pelangganCount &&
      mobilWithNewFields === mobilCount;

    if (isComplete) {
      console.log("✅ Migration completed successfully!");
      return true;
    } else {
      console.log(
        "⚠️  Migration partially completed - some documents may need manual review"
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    return false;
  }
}

async function backupCollections() {
  console.log("\n💾 Creating Backup Collections...");

  try {
    const db = mongoose.connection.db;
    const timestamp = Date.now();

    // Create backup of pelanggans
    const pelanggansBackup = await db.collection("pelanggans").find().toArray();
    if (pelanggansBackup.length > 0) {
      await db
        .collection(`pelanggans_backup_${timestamp}`)
        .insertMany(pelanggansBackup);
      console.log(
        `✅ Backed up ${pelanggansBackup.length} Pelanggan documents`
      );
    }

    // Create backup of mobils
    const mobilsBackup = await db.collection("mobils").find().toArray();
    if (mobilsBackup.length > 0) {
      await db
        .collection(`mobils_backup_${timestamp}`)
        .insertMany(mobilsBackup);
      console.log(`✅ Backed up ${mobilsBackup.length} Mobil documents`);
    }
  } catch (error) {
    console.error("❌ Backup failed:", error.message);
    console.log("⚠️  Continuing without backup...");
  }
}

async function runMigration() {
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Create backups first
    await backupCollections();

    // Run migrations
    await migratePelangganCollection();
    await migrateMobilCollection();

    // Create indexes
    await createIndexes();

    // Validate migration
    const success = await validateMigration();

    console.log("\n🎉 FIXED Migration Process Complete!");
    console.log("====================================");

    if (success) {
      console.log("✅ All collections successfully migrated");
      console.log("✅ Indexes created/verified");
      console.log("✅ Ready for production use");
      console.log("\n🚀 NEXT STEPS:");
      console.log("   1. Test new API endpoints");
      console.log("   2. Update dashboard components");
      console.log("   3. Verify enhanced features work");
    } else {
      console.log("⚠️  Migration completed with warnings");
      console.log("🔍 Some documents may need manual review");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📴 Disconnected from MongoDB");
  }
}

// Add command line argument handling
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🚀 FIXED Database Migration Script
==================================

Usage: node scripts/migrate-database-fixed.js [options]

Options:
  --help, -h     Show this help message
  --force        Skip confirmation prompts

Examples:
  node scripts/migrate-database-fixed.js
  node scripts/migrate-database-fixed.js --force
  `);
  process.exit(0);
}

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required");
  console.log(
    "💡 Create a .env file with: MONGODB_URI=your_mongodb_connection_string"
  );
  process.exit(1);
}

// Confirmation prompt (unless --force is used)
if (!args.includes("--force")) {
  console.log("⚠️  This will fix the previous migration issues");
  console.log("💾 New backups will be created automatically");
  console.log("");

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Continue with FIXED migration? (y/N): ", (answer) => {
    rl.close();
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
      runMigration();
    } else {
      console.log("❌ Migration cancelled");
      process.exit(0);
    }
  });
} else {
  runMigration();
}
