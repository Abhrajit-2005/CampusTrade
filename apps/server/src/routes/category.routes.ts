import { Router } from "express";
import { getCategories } from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getCategories
);

export default router;
