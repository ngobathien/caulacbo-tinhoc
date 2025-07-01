import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

// Đăng nhập và đăng ký
router.post("/login", (req, res) => AuthController.login(req, res)); // Đảm bảo ngữ cảnh this đúng
router.post("/register", (req, res) => AuthController.register(req, res));

// xac thực người dùng bằng token
router.get("/verify/:token", (req, res) =>
  AuthController.verifyAccount(req, res)
);
export default router;
