import { Router } from "express";
import {
  create,
  getById,
  list,
  update,
  remove,
  recommend,
} from "../controllers/recipe.controller.js";

const router = Router();

router.post("/", create);
router.get("/", list);
router.post("/recommend", recommend);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
