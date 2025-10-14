import React, { useState, useEffect } from "react";
import {
  submitAssignment,
  getMySubmission,
  downloadSubmission,
} from "../../services/submissionService";
import { toast } from "react-toastify";

function SubmitAssignment({
  assignmentId,
  dueDate,
  nameClass,
  nameGroup,
  classId,
  groupId,
}) {
  const [file, setFile] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const fetchMySubmission = async () => {
    const data = await getMySubmission(assignmentId);
    setSubmission(data);
  };

  useEffect(() => {
    fetchMySubmission();
  }, [assignmentId]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Vui lòng chọn file.");
    try {
      await submitAssignment(
        assignmentId,
        file,
        nameClass,
        nameGroup,
        classId,
        groupId
      );
      toast.success(
        isResubmitting ? "Đã nộp lại bài thành công!" : "Đã nộp bài thành công!"
      );
      setFile(null);
      setIsResubmitting(false);
      fetchMySubmission();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nộp bài thất bại!");
    }
  };

  const handleResubmit = () => {
    setIsResubmitting(true);
    setFile(null);
  };

  return (
    <div>
      {!submission || isResubmitting ? (
        <form onSubmit={handleSubmit} className="mb-2">
          <input type="file" onChange={handleFileChange} required />
          <button
            type="submit"
            className="bg-green-600 text-white px-3 py-1 rounded ml-2"
          >
            {isResubmitting ? "Nộp lại bài" : "Nộp bài"}
          </button>
          {submission && (
            <button
              type="button"
              className="bg-gray-400 text-white px-3 py-1 rounded ml-2"
              onClick={() => setIsResubmitting(false)}
            >
              Hủy
            </button>
          )}
        </form>
      ) : (
        <div className="mb-2">
          <b>Đã nộp:</b> {new Date(submission.submittedAt).toLocaleString()}{" "}
          <br />
          <button
            onClick={() => downloadSubmission(submission.storagePath)}
            className="text-blue-500 underline"
          >
            Tải file đã nộp
          </button>
          <div>
            {submission.grade !== null ? (
              <span className="text-green-700">
                Điểm: {submission.grade} | Nhận xét: {submission.feedback}
              </span>
            ) : (
              <span className="text-yellow-600">Chưa chấm điểm</span>
            )}
          </div>
          <div>
            <button
              onClick={handleResubmit}
              className="bg-yellow-500 text-white px-3 py-1 rounded mt-2"
            >
              Nộp lại bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmitAssignment;
