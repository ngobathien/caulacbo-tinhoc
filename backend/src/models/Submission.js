import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },

    fileUrl: { type: String, required: true }, // Đường dẫn file trên server
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, default: null }, // Điểm
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
