import { Router } from "express";
import CategoryController from "../controller/CategoryController.js";

const router = Router();

router.get("/", CategoryController.getAll);
router.get("/search", CategoryController.getByKeyword);
router.get("/:id", CategoryController.getById);
router.post("/", CategoryController.create);
router.put("/:id", CategoryController.update);
router.delete("/:id", CategoryController.remove);

export default router;