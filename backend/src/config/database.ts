import mongoose from "mongoose";
import { config } from "./index.js";

let mongoClient: unknown = null;
let mongoDb: unknown = null;

export async function connectDatabase(): Promise<void> {
  try {
    if (!config.mongodbUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(config.mongodbUri);
    mongoClient = mongoose.connection.getClient();
    mongoDb = mongoose.connection.db;

    console.log("MongoDB connected successfully");

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

export function getMongoClient(): unknown {
  if (!mongoClient) {
    throw new Error("MongoDB client is not initialized. Call connectDatabase() first.");
  }

  return mongoClient;
}

export function getMongoDb(): unknown {
  if (!mongoDb) {
    throw new Error("MongoDB database is not initialized. Call connectDatabase() first.");
  }

  return mongoDb;
}
