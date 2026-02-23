import { Router } from "express";
import { getSession, login, logout, register, updateProfile } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/session", getSession);
router.post("/logout", logout);
router.put("/profile", updateProfile);

export default router;
