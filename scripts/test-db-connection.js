// scripts/test-db-connection.js - Test MongoDB Connection
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env files
function loadEnvFiles() {
  const envFiles = [".env.local", ".env", ".env.production"];
  const envVars = {};

  envFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");

        lines.forEach((line) => {
          line = line.trim();
          if (line && !line.startsWith("#")) {
            const [key, ...values] = line.split("=");
            if (key && values.length > 0) {
              const value = values.join("=").replace(/^["']|["']$/g, "");
              envVars[key.trim()] = value.trim();
            }
          }
        });
      } catch (error) {
        console.error(`Error reading ${file}: ${error.message}`);
      }
    }
  });

  return { ...envVars, ...process.env };
}

console.log("🔌 MongoDB Connection Test");
console.log("==========================");

async function testConnection() {
  const envVars = loadEnvFiles();
  const mongoUri = envVars.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in environment variables");
    console.log("💡 Make sure your .env file contains:");
    console.log(
      "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    );
    process.exit(1);
  }

  console.log("📋 Connection Details:");
  try {
    const url = new URL(mongoUri);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Database: ${url.pathname.substring(1) || "default"}`);
    console.log(`   SSL: ${url.searchParams.get("ssl") || "auto"}`);
  } catch (error) {
    console.error("❌ Invalid MongoDB URI format");
    process.exit(1);
  }

  console.log("\n🔄 Attempting to connect...");

  try {
    // Connect with timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });

    console.log("✅ Successfully connected to MongoDB!");

    // Test basic operations
    console.log("\n🧪 Testing basic operations...");

    // List collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`✅ Found ${collections.length} collections:`);

    collections.forEach((collection, index) => {
      if (index < 10) {
        // Show first 10 collections
        console.log(`   - ${collection.name}`);
      } else if (index === 10) {
        console.log(`   ... and ${collections.length - 10} more`);
      }
    });

    // Check specific collections we need
    console.log("\n📊 Checking required collections:");
    const requiredCollections = [
      "mobils",
      "pelanggans",
      "activitylogs",
      "users",
    ];

    for (const collectionName of requiredCollections) {
      try {
        const count = await mongoose.connection.db
          .collection(collectionName)
          .countDocuments();
        console.log(`   ✅ ${collectionName}: ${count} documents`);
      } catch (error) {
        console.log(
          `   ⚠️  ${collectionName}: Collection not found (will be created automatically)`
        );
      }
    }

    // Test write operation
    console.log("\n✏️ Testing write operation...");
    try {
      const testCollection =
        mongoose.connection.db.collection("connection_test");
      const testDoc = {
        test: true,
        timestamp: new Date(),
        message: "Connection test successful",
      };

      const result = await testCollection.insertOne(testDoc);
      console.log("✅ Write test successful");

      // Clean up test document
      await testCollection.deleteOne({ _id: result.insertedId });
      console.log("✅ Cleanup successful");
    } catch (error) {
      console.log("⚠️  Write test failed (might be read-only access)");
    }

    console.log("\n🎉 MongoDB connection test completed successfully!");
    console.log("✅ Your database is ready for the application");
  } catch (error) {
    console.error("\n❌ Connection failed:");

    if (error.name === "MongoServerSelectionError") {
      console.error(
        "   • Server selection timeout - check your connection string"
      );
      console.error("   • Make sure your IP is whitelisted in MongoDB Atlas");
      console.error("   • Verify your username and password are correct");
    } else if (error.name === "MongoParseError") {
      console.error("   • Invalid MongoDB URI format");
      console.error("   • Check your connection string syntax");
    } else {
      console.error(`   • ${error.message}`);
    }

    console.log("\n💡 Troubleshooting tips:");
    console.log("   1. Check your MongoDB Atlas cluster is running");
    console.log("   2. Verify network access (IP whitelist)");
    console.log("   3. Confirm username/password are correct");
    console.log("   4. Test connection from MongoDB Compass first");

    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error.message);
  process.exit(1);
});

// Run the test
testConnection();
