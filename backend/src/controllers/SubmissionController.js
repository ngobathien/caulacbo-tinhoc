import Submission from "../models/Submission.js";
import path from "path";
import fs from "fs";
import supabase from "../config/supabase.js";

const bucket_name_assignments = "itclub-file";

class SubmissionController {
  // Nộp bài (upload file) - Cho phép nộp lại
  async submitAssignment(req, res) {
    try {
      // Nhận dữ liệu từ client
      const { assignmentId, nameClass, nameGroup, classId, groupId } = req.body;

      const studentId = req.user._id;

      // Kiểm tra có file được gửi lên không
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const file = req.file;

      const filePath = `uploads/assignments/${assignmentId}-${nameClass}-${nameGroup}/${req.file.originalname}`;
      // const fileUrl = `/uploads/assignments/${assignmentId}-${nameClass}-${nameGroup}/${req.file.filename}`;
      // console.log(filePath);

      // Upload file lên supabase
      const { data, error } = await supabase.storage
        .from(bucket_name_assignments)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      // Lấy link lưu vào database
      const { data: publicUrlData } = await supabase.storage
        .from(bucket_name_assignments)
        .getPublicUrl(filePath);

      // path lưu vào database
      const fileUrl = publicUrlData.publicUrl;
      const storagePath = filePath;
      console.log(fileUrl);
      //
      let submission = await Submission.findOne({ assignmentId, studentId });

      // Nộp lại file
      if (submission) {
        submission.fileUrl = fileUrl;
        submission.storagePath = storagePath;
        submission.submittedAt = new Date();
        submission.grade = null;
        submission.feedback = "";
        if (classId) submission.classId = classId;
        if (groupId) submission.groupId = groupId;

        await submission.save();
        return res.json({ message: "Đã nộp lại", submission });
      }

      // Lưu vào database
      submission = new Submission({
        assignmentId,
        studentId,
        classId,
        groupId,
        fileUrl,
        storagePath,
        submittedAt: new Date(),
      });

      await submission.save();
      res.status(201).json(submission);
    } catch (error) {
      console.log(error);
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

  // Tải bài nộp về từ Supabase
  async downloadSubmission(req, res) {
    try {
      const { path } = req.query; // lấy path từ query
      console.log(path);
      if (!path) {
        return res.status(400).json({ message: "Missing file path" });
      }

      // Download file từ Supabase
      const { data, error } = await supabase.storage
        .from(bucket_name_assignments)
        .download(path);
      // it-club/uploads/assignments/68ee04d64018e9e774b86ce5-js-js 1/ngobathien.pdf

      if (error) {
        console.error("Error downloading from Supabase:", error);
        return res.status(500).json({ message: "Download file failed" });
      }

      // Lấy tên file từ path
      const fileName = path.split("/").pop();

      // Set header để tải file đúng định dạng
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.setHeader("Content-Type", data.type);

      // Stream file về FE
      return res.send(Buffer.from(await data.arrayBuffer()));
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to download submission",
        error: error.message,
      });
    }
  }
}

export default new SubmissionController();
