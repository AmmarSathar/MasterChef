import { Router } from "express";
import { updateProfile, setPassword } from "../controllers/auth.controller.js";
import { requireSession } from "../middleware/auth.middleware.js";

const router = Router();

// PUT /api/user/profile — session-protected profile update
// Kept outside /api/auth/* to avoid being intercepted by BetterAuth's handler
router.put("/profile", requireSession, updateProfile);

// POST /api/user/set-password — add email/password login to an OAuth-only account
// Requires active session; delegates to BetterAuth's internal setPassword API
router.post("/set-password", requireSession, setPassword);

export default router;
