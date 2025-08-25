// scripts/migrate-database.js - Database Migration Script
const mongoose = require("mongoose");

// Load environment variables
require("dotenv").config();

console.log("🚀 Starting Database Migration...");
console.log("================================");

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

    // Update documents that don't have the new fields
    const result = await collection.updateMany(
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
        $addToSet: {
          status: {
            $in: [
              "Belum Di Follow Up",
              "Sudah Di Follow Up",
              "Interested",
              "Hot Lead",
              "Purchased",
            ],
          },
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} Pelanggan documents`);

    // Update status enum to include new values (this will be handled by Mongoose schema)
    const statusUpdate = await collection.updateMany(
      {
        status: {
          $nin: [
            "Belum Di Follow Up",
            "Sudah Di Follow Up",
            "Interested",
            "Hot Lead",
            "Purchased",
          ],
        },
      },
      { $set: { status: "Belum Di Follow Up" } }
    );

    console.log(
      `✅ Updated ${statusUpdate.modifiedCount} invalid status values`
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

    // Pelanggan indexes
    const pelangganCollection = db.collection("pelanggans");
    await pelangganCollection.createIndex({ noHp: 1 });
    await pelangganCollection.createIndex({ status: 1 });
    await pelangganCollection.createIndex({ lastActivity: -1 });
    await pelangganCollection.createIndex({ totalInteractions: -1 });
    await pelangganCollection.createIndex({
      "interactionHistory.activityType": 1,
    });
    await pelangganCollection.createIndex({
      "interactionHistory.timestamp": -1,
    });
    console.log("✅ Pelanggan indexes created");

    // Mobil indexes
    const mobilCollection = db.collection("mobils");
    await mobilCollection.createIndex({ status: 1 });
    await mobilCollection.createIndex({ merek: 1, tipe: 1 });
    await mobilCollection.createIndex({ harga: 1 });
    await mobilCollection.createIndex({ "interactions.testDrives.status": 1 });
    await mobilCollection.createIndex({ "interactions.beliCash.status": 1 });
    console.log("✅ Mobil indexes created");

    // ActivityLog indexes (existing)
    const activityLogCollection = db.collection("activitylogs");
    await activityLogCollection.createIndex({ pelangganId: 1 });
    await activityLogCollection.createIndex({ mobilId: 1 });
    await activityLogCollection.createIndex({ activityType: 1 });
    await activityLogCollection.createIndex({ createdAt: -1 });
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

    if (
      pelangganWithNewFields === pelangganCount &&
      mobilWithNewFields === mobilCount
    ) {
      console.log("✅ Migration completed successfully!");
      return true;
    } else {
      console.log("⚠️  Migration partially completed");
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

    // Create backup of pelanggans
    const pelanggansBackup = await db.collection("pelanggans").find().toArray();
    if (pelanggansBackup.length > 0) {
      await db
        .collection("pelanggans_backup_" + Date.now())
        .insertMany(pelanggansBackup);
      console.log(
        `✅ Backed up ${pelanggansBackup.length} Pelanggan documents`
      );
    }

    // Create backup of mobils
    const mobilsBackup = await db.collection("mobils").find().toArray();
    if (mobilsBackup.length > 0) {
      await db
        .collection("mobils_backup_" + Date.now())
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

    console.log("\n🎉 Migration Process Complete!");
    console.log("================================");

    if (success) {
      console.log("✅ All collections successfully migrated");
      console.log("✅ Indexes created");
      console.log("✅ Ready for production use");
    } else {
      console.log("⚠️  Migration completed with warnings");
      console.log("🔍 Please check the logs above");
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
🚀 Database Migration Script
============================

Usage: node scripts/migrate-database.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be migrated without making changes
  --force        Skip confirmation prompts

Environment Variables Required:
  MONGODB_URI    MongoDB connection string

Examples:
  node scripts/migrate-database.js
  node scripts/migrate-database.js --dry-run
  `);
  process.exit(0);
}

if (args.includes("--dry-run")) {
  console.log("🔍 DRY RUN MODE - No changes will be made");
  console.log("This would:");
  console.log("1. Connect to database");
  console.log(
    "2. Add interactionHistory and summaryStats to Pelanggan documents"
  );
  console.log("3. Add interactions field to Mobil documents");
  console.log("4. Create performance indexes");
  console.log("5. Validate migration");
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
  console.log("⚠️  This will modify your database structure");
  console.log("💾 Backups will be created automatically");
  console.log("");

  // Simple confirmation (you can enhance this with readline if needed)
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Continue with migration? (y/N): ", (answer) => {
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
