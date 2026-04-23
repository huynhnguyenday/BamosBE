import express from "express";
import {
  getActiveCategory,
  getActiveProducts,
  getHomeBootstrapData,
  getHotProducts,
  getProductById,
} from "../controllers/mainPage.controller.js";

const router = express.Router();

router.get("/activeCategories", getActiveCategory);
router.get("/activeProducts", getActiveProducts);
router.get("/homeBootstrap", getHomeBootstrapData);
router.get("/:id", getProductById);
router.get("/", getHotProducts);

export default router;
