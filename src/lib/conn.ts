import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const cached = (global as any).mongoose || { conn: null, promise: null };

export default async function connectMongo() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "radjaautocar", // pastikan ini sesuai dengan cluster/database abang
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
