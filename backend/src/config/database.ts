import mongoose from "mongoose";
import { config } from "./index.js";

export async function connectDatabase(): Promise<void> {
  try {
    if (!config.mongodbUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(config.mongodbUri);

    console.log("✓ MongoDB connected successfully");

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
