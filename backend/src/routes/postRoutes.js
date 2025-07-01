import express from "express";
import PostController from "../controllers/PostController.js";
import {
  protect,
  checkPostOwnerOrAdmin,
} from "../middlewares/postMiddleware.js";

const router = express.Router();

// routes post: bài viết

// http://localhost:4000/posts/
router.get("/", PostController.getAllPost);

// Thêm vào sau các route khác
router.get("/:id", PostController.getPostById);

router.post("/", protect, PostController.createPost);

// Check là admin hoặc tác giả bài viết đó mới được thực hiện sửa/xóa
router.put("/:id", protect, checkPostOwnerOrAdmin, PostController.editPost);
router.delete(
  "/:id",
  protect,
  checkPostOwnerOrAdmin,
  PostController.deletePost
);

// Thêm dòng này vào sau các route khác
router.patch("/:id/like", protect, PostController.likePost);

export default router;
