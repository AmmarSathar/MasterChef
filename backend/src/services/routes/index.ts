import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount route modules here
// router.use("/auth", authRoutes);

export default router;
