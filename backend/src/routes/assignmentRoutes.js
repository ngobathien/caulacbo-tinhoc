import express from "express";
import AssignmentController from "../controllers/AssignmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

// lấy danh sách bài tập, lấy thông tin bài tập, tạo bài tập, cập nhật bài tập, xóa bài tập
router.get("/", protect, AssignmentController.getAssignments);

// tạo bài tập
router.post("/", protect, AssignmentController.createAssignment);

// cập nhật bài tập
router.put("/:id", protect, AssignmentController.updateAssignment);

// xóa bài tập
router.delete("/:id", protect, AssignmentController.deleteAssignment);

export default router;
