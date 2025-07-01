import React, { useState } from "react";
import { gradeSubmission } from "../../services/submissionService";
import { toast } from "react-toastify";

export default function GradeSubmissionForm({ submission, onSuccess }) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await gradeSubmission(submission._id, grade, feedback);
      toast.success("Chấm điểm thành công!");
      onSuccess && onSuccess();
    } catch (err) {
      toast.error("Chấm điểm thất bại!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="number"
        min={0}
        max={10}
        className="border px-2 py-1 w-16"
        placeholder="Điểm"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        required
        disabled={loading}
      />
      <input
        className="border px-2 py-1"
        placeholder="Nhận xét"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 rounded"
        disabled={loading}
      >
        Lưu
      </button>
    </form>
  );
}
