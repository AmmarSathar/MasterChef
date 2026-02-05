import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount route modules
router.use("/api/auth", authRoutes);
router.use("/api/user", userRoutes);

export default router;
