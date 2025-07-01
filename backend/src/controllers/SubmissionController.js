import Submission from "../models/Submission.js";
import path from "path";
import fs from "fs";

class SubmissionController {
  // Nộp bài (upload file) - Cho phép nộp lại
  async submitAssignment(req, res) {
    try {
      const { assignmentId, nameClass, nameGroup, classId, groupId } = req.body;
      const studentId = req.user._id;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/assignments/${assignmentId}-${nameClass}-${nameGroup}/${req.file.filename}`;

      let submission = await Submission.findOne({ assignmentId, studentId });
      if (submission) {
        submission.fileUrl = fileUrl;
        submission.submittedAt = new Date();
        submission.grade = null;
        submission.feedback = "";
        if (classId) submission.classId = classId;
        if (groupId) submission.groupId = groupId;
        await submission.save();
        return res.json({ message: "Đã nộp lại", submission });
      }

      submission = new Submission({
        assignmentId,
        studentId,
        classId,
        groupId,
        fileUrl,
        submittedAt: new Date(),
      });
      await submission.save();
      res.status(201).json(submission);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to submit", error: error.message });
    }
  }

  // Lấy bài nộp của bản thân cho bài tập này
  async getMySubmission(req, res) {
    try {
      const { assignmentId } = req.params;
      const studentId = req.user._id;
      const submission = await Submission.findOne({ assignmentId, studentId });
      res.json(submission);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get submission", error: error.message });
    }
  }

  // Lấy tất cả bài nộp của một bài tập (cho giáo viên/chấm điểm)
  async getSubmissionsOfAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const submissions = await Submission.find({ assignmentId }).populate(
        "studentId",
        "username email"
      );
      res.json(submissions);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get submissions", error: error.message });
    }
  }

  // Chấm điểm/chỉnh sửa nhận xét
  async gradeSubmission(req, res) {
    try {
      const { id } = req.params;
      const { grade, feedback } = req.body;
      const submission = await Submission.findByIdAndUpdate(
        id,
        { grade, feedback },
        { new: true }
      );
      if (!submission)
        return res.status(404).json({ message: "Submission not found" });
      res.json(submission);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to grade", error: error.message });
    }
  }

  // Tải bài nộp về
  async downloadSubmission(req, res) {
    try {
      const { id } = req.params;
      const submission = await Submission.findById(id);

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Lấy đường dẫn vật lý thực tế từ fileUrl
      const fileUrl = submission.fileUrl;
      const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
      const filePath = path.join(process.cwd(), relativePath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      res.download(filePath);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Download failed", error: error.message });
    }
  }
}

export default new SubmissionController();
