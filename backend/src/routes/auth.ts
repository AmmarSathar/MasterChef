import { Router } from "express";
import {
  getProfile,
  getSession,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/session", getSession);
router.post("/logout", logout);
router.get("/profile/:userId", getProfile);
router.put("/profile", updateProfile);

export default router;
