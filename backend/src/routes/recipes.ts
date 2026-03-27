import { Router } from "express";
import {
  create,
  getById,
  list,
  search,
  update,
  remove,
  recommend,
  parseFromUrl,
} from "../controllers/recipe.controller.js";

const router = Router();

router.post("/", create);
router.post("/parse-url", parseFromUrl);
router.get("/", list);
router.get("/search", search);
router.post("/recommend", recommend);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
