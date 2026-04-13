import mongoose from "mongoose";
import { config } from "./index.js";

function extractMongoDatabaseName(uri: string): string | null {
  const protocolIndex = uri.indexOf("://");
  if (protocolIndex === -1) return null;

  const pathStart = uri.indexOf("/", protocolIndex + 3);
  if (pathStart === -1) return null;

  const pathAndQuery = uri.slice(pathStart + 1);
  const dbName = pathAndQuery.split("?")[0]?.trim();

  return dbName ? dbName : null;
}

export async function connectDatabase(): Promise<void> {
  try {
    if (!config.mongodbUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const databaseName = extractMongoDatabaseName(config.mongodbUri);
    if (!databaseName) {
      throw new Error(
        "MONGODB_URI must include an explicit database name, for example mongodb://host:27017/cookwise"
      );
    }

    await mongoose.connect(config.mongodbUri);

    console.log(
      `MongoDB connected successfully to database "${mongoose.connection.name}"`
    );

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
