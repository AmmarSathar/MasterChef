import { Router } from "express";
import authRoutes from "./auth.js";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount route modules
router.use("/api/auth", authRoutes);

export default router;
