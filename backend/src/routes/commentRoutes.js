import express from "express";
import CommentController from "../controllers/CommentController.js";
const router = express.Router();

// routes comment

// Lấy danh sách bình luận
router.get("/", CommentController.getComment);

// thêm bình luận
router.post("/", CommentController.addComment);

// cập nhật bình luận
router.put("/:commentId", CommentController.updateComment);

// xóa bình luận
router.delete("/:commentId", CommentController.deleteComment);

export default router;
