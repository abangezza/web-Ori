// src/lib/conn.ts - Improved MongoDB Connection with Better Error Handling
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined in environment variables. " +
      "Please check your .env.local file or environment configuration."
  );
}

// Global is used here to maintain a cached connection across hot reloads in development.
const cached = (global as any).mongoose || { conn: null, promise: null };

export default async function connectMongo() {
  // If we have a cached connection, return it
  if (cached.conn) {
    console.log("📦 Using cached MongoDB connection");
    return cached.conn;
  }

  // If we don't have a cached connection, but we have a promise, return it
  if (!cached.promise) {
    console.log("🔌 Creating new MongoDB connection...");

    const opts = {
      dbName: "radjaautocar",
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };

    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts);

      // Set up event listeners
      mongoose.connection.on("connected", () => {
        console.log("✅ MongoDB connected successfully");
      });

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected");
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed through app termination");
        process.exit(0);
      });
    } catch (error) {
      console.error("❌ Failed to create MongoDB connection:", error);
      cached.promise = null;
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connection established");
    return cached.conn;
  } catch (error) {
    console.error("❌ Failed to establish MongoDB connection:", error);
    cached.promise = null;
    throw new Error(
      `MongoDB connection failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Export function to check connection status
export async function checkMongoConnection(): Promise<boolean> {
  try {
    await connectMongo();
    return mongoose.connection.readyState === 1;
  } catch (error) {
    console.error("MongoDB connection check failed:", error);
    return false;
  }
}

// Export function to get connection info
export function getConnectionInfo() {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    states: {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    },
  };
}
