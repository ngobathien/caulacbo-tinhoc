// import express from "express";
// import AuthController from "../controllers/AuthController.js";

// const router = express.Router();

// // Đăng nhập và đăng ký
// router.post("/login", (req, res) => AuthController.login(req, res)); // Đảm bảo ngữ cảnh this đúng
// router.post("/register", (req, res) => AuthController.register(req, res));

// // xac thực người dùng bằng token
// router.get("/verify/:token", (req, res) =>
//   AuthController.verifyAccount(req, res)
// );
// export default router;

import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

// Áp dụng limiter cho login/register
router.post("/login", (req, res) => AuthController.login(req, res));

router.post("/register", (req, res) => AuthController.register(req, res));

// Xác thực token
router.get("/verify/:token", (req, res) =>
  AuthController.verifyAccount(req, res)
);

export default router;
