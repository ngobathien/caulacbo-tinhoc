import express from "express";
import authRoutes from "./authRoutes.js";
import postRoutes from "./postRoutes.js";
import userRoutes from "./userRoutes.js";
import classRoutes from "./classesRoutes.js";
import groupRoutes from "./groupRoutes.js";
import countRoutes from "./countRoutes.js";
import commentRoutes from "./commentRoutes.js";
import assignmentRoutes from "./assignmentRoutes.js";
import submissionRoutes from "./submissionRoutes.js";
const router = express.Router();

// http://localhost:4000/api/v1/auth/
router.use("/auth", authRoutes);

// http://localhost:4000/api/v1/users/
router.use("/users", userRoutes);

// http://localhost:4000/api/v1/posts/
router.use("/posts", postRoutes);

// http://localhost:4000/api/v1/classes/
router.use("/classes", classRoutes);

// http://localhost:4000/api/v1/groups/
router.use("/groups", groupRoutes);

// http://localhost:4000/api/v1/counts/
router.use("/counts", countRoutes);

// http://localhost:4000/api/v1/comments/
router.use("/comments", commentRoutes);

router.use("/assignments", assignmentRoutes);

router.use("/submissions", submissionRoutes);

export default router;
