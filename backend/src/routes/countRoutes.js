import express from "express";
import CountController from "../controllers/CountController.js";
const router = express.Router();

// routes count để hiển thị ở trang admin

// http://localhost:4000/counts/all
router.get("/all", CountController.count);

export default router;
