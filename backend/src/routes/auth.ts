import { Router } from "express";
import { register, login, updateProfile } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.put("/profile", updateProfile);

export default router;
