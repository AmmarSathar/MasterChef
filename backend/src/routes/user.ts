import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { AuthenticatedRequest } from "../types/index.js";

const router = Router();

router.get("/profile", authenticate as any, getProfile as any);
router.put("/profile", authenticate as any, updateProfile as any);

export default router;
