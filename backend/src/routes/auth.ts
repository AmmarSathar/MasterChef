import { Router } from "express";
import { updateProfile } from "../controllers/auth.controller.js";
import { requireSession } from "../middleware/auth.middleware.js";

const router = Router();

// All /api/auth/sign-in, /api/auth/sign-up, /api/auth/session, etc.
// are handled by BetterAuth in app.ts (mounted before this router)

// Profile update — requires an active session
router.put("/profile", requireSession, updateProfile);

export default router;
