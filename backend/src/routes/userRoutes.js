import express from "express";
import UserController from "../controllers/UserController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadAvatar.js";

const router = express.Router();

// routes user

// Cập nhật thông tin người dùng (cho phép upload avatar)
router.put("/:id", protect, upload.single("avatar"), (req, res) =>
  UserController.updateUser(req, res)
);

// Lấy danh sách người dùng (chỉ admin)
router.get("/", protect, isAdmin, (req, res) =>
  UserController.getUsers(req, res)
);

// Lấy thông tin người dùng theo ID (chỉ admin)
router.get("/:id", protect, isAdmin, (req, res) =>
  UserController.getUserById(req, res)
);

// Tạo người dùng mới (chỉ admin)
router.post("/", protect, isAdmin, (req, res) =>
  UserController.createUser(req, res)
);

// Xóa người dùng (chỉ admin)
router.delete("/:id", protect, isAdmin, (req, res) =>
  UserController.deleteUser(req, res)
);

// Lấy thông tin cá nhân (người dùng đã đăng nhập)
router.get("/profile/:id", protect, (req, res) =>
  UserController.getProfile(req, res)
);

// Admin duyệt tài khoản user
router.put("/approve/:id", protect, isAdmin, (req, res) =>
  UserController.approveUser(req, res)
);

export default router;
