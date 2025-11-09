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
  // State mới để quản lý loading chung (cho submit/fetch)
  const [isLoading, setIsLoading] = useState(false);
  // State mới để quản lý loading riêng cho tải file
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchMySubmission = async () => {
    // Không cần set isLoading ở đây vì nó được gọi ngay khi component mount
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

    setIsLoading(true); // Bắt đầu loading
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
        isResubmitting
          ? "Đã nộp lại bài thành công! "
          : "Đã nộp bài thành công! "
      );
      setFile(null);
      setIsResubmitting(false);
      fetchMySubmission();
    } catch (err) {
      toast.error(err.response?.data?.message || "Nộp bài thất bại! ");
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  // Hàm mới để xử lý việc tải file
  const handleDownload = async (storagePath) => {
    setIsDownloading(true); // Bắt đầu loading tải file
    try {
      await downloadSubmission(storagePath);
      toast.info("File đang được tải về... ");
    } catch (error) {
      toast.error("Tải file thất bại! ");
    } finally {
      setIsDownloading(false); // Kết thúc loading tải file
    }
  };

  const handleResubmit = () => {
    setIsResubmitting(true);
    setFile(null);
  };

  const submitButtonText = isResubmitting ? "Nộp lại bài" : "Nộp bài";
  const disabledSubmit = isLoading || !file;

  return (
    <div>
      {/* Hiển thị Loading khi đang submit/resubmit */}
      {isLoading && <p className="text-blue-500">Đang xử lý nộp bài...</p>}

      {!submission || isResubmitting ? (
        <form onSubmit={handleSubmit} className="mb-2">
          <input
            type="file"
            onChange={handleFileChange}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-3 py-1 rounded ml-2 ${
              disabledSubmit
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            disabled={disabledSubmit}
          >
            {isLoading ? "Đang nộp..." : submitButtonText}
          </button>
          {submission && (
            <button
              type="button"
              className="bg-gray-400 text-white px-3 py-1 rounded ml-2 hover:bg-gray-500"
              onClick={() => setIsResubmitting(false)}
              disabled={isLoading}
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
            onClick={() => handleDownload(submission.storagePath)} // Dùng hàm handleDownload mới
            className={`text-blue-500 underline ${
              isDownloading
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-blue-700"
            }`}
            disabled={isDownloading}
          >
            {isDownloading ? "Đang tải file..." : "Tải file đã nộp"}
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
              className="bg-yellow-500 text-white px-3 py-1 rounded mt-2 hover:bg-yellow-600"
              disabled={isLoading || isDownloading}
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
