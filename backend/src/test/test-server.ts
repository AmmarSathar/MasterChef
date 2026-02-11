import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";

const port = Number(process.env.PORT || 4000);

async function start() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  const server = app.listen(port, () => {
    console.log(`Test server listening on http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start test server:", err);
  process.exit(1);
});
