import app from "./app.js";
import { config } from "./config/index.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDatabase();

    // Start Express server
    app.listen(config.port, () => {
      console.log(`✓ Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
