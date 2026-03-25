"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recipe_controller_js_1 = require("../controllers/recipe.controller.js");
const router = (0, express_1.Router)();
router.post("/", recipe_controller_js_1.create);
router.get("/", recipe_controller_js_1.list);
router.get("/search", recipe_controller_js_1.search);
router.post("/recommend", recipe_controller_js_1.recommend);
router.get("/:id", recipe_controller_js_1.getById);
router.put("/:id", recipe_controller_js_1.update);
router.delete("/:id", recipe_controller_js_1.remove);
exports.default = router;
//# sourceMappingURL=recipes.js.map