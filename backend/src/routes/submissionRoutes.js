import express from "express";
import SubmissionController from "../controllers/SubmissionController.js";
import { protect } from "../middlewares/authMiddleware.js";

import uploadSubmission from "../middlewares/uploadSubmission.js";

const router = express.Router();

// routes submission để phục vụ nộp bài tập

// Nộp bài assignment
router.post(
  "/submit",
  protect,
  uploadSubmission.single("file"),
  SubmissionController.submitAssignment
);

// Xem bài nộp của chính mình
router.get("/my/:assignmentId", protect, SubmissionController.getMySubmission);

// Lấy danh sách bài nộp của một assignment
router.get(
  "/assignment/:assignmentId",
  protect,
  SubmissionController.getSubmissionsOfAssignment
);

// Chấm điểm
router.put("/grade/:id", protect, SubmissionController.gradeSubmission);

// Tải file
router.get("/download/:id", SubmissionController.downloadSubmission);

export default router;
