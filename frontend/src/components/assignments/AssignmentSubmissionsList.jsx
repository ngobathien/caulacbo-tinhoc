import React, { useEffect, useState, useRef } from "react";
import {
  getSubmissionsOfAssignment,
  downloadSubmission,
  gradeSubmission,
} from "../../services/submissionService";
import { toast } from "react-toastify";
import { getGroupsUserJoined } from "../../services/groupService";

function AssignmentSubmissionsList({ assignmentId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null); // ID submission đang sửa
  const [editGrade, setEditGrade] = useState("");
  const [editFeedback, setEditFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [gradeError, setGradeError] = useState("");

  const modalRef = useRef(null);

  // Lấy vai trò user hiện tại (giả sử lưu ở localStorage)
  const role = localStorage.getItem("role");
  const isAdminOrTeacher = role === "admin" || role === "teacher";
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const isMemberOrTeacher = role === "member" || role === "teacher";

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getSubmissionsOfAssignment(assignmentId);
      setSubmissions(data);
    } catch {
      setSubmissions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showModal) {
      fetchSubmissions();
    }
    // eslint-disable-next-line
  }, [assignmentId, showModal]);

  // Đóng modal khi click ra ngoài
  useEffect(() => {
    if (!showModal) return;
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const startEdit = (submission) => {
    setEditId(submission._id);
    setEditGrade(submission.grade ?? "");
    setEditFeedback(submission.feedback ?? "");
    setGradeError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditGrade("");
    setEditFeedback("");
    setGradeError("");
  };

  const handleGradeChange = (e) => {
    const value = e.target.value;
    setEditGrade(value);
    if (parseFloat(value) > 10) {
      setGradeError("Điểm không được lớn hơn 10");
    } else {
      setGradeError("");
    }
  };

  const saveEdit = async (submissionId) => {
    if (parseFloat(editGrade) > 10) {
      setGradeError("Điểm không được lớn hơn 10");
      return;
    }
    try {
      await gradeSubmission(submissionId, editGrade, editFeedback);
      toast.success("Chấm/sửa điểm thành công!");
      setEditId(null);
      setGradeError("");
      fetchSubmissions();
    } catch {
      toast.error("Chấm điểm thất bại!");
    }
  };

  return (
    <>
      <button
        className="text-blue-600 underline font-semibold hover:text-blue-800 mb-2"
        onClick={() => setShowModal(true)}
      >
        Danh sách nộp bài
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-40">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            tabIndex={-1}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
              onClick={() => setShowModal(false)}
              title="Đóng"
            >
              ×
            </button>
            <div className="p-6 pt-4">
              <h4 className="font-semibold mb-4 text-lg text-center">
                Danh sách nộp bài
              </h4>
              {loading ? (
                <div className="text-center text-gray-600 py-6">
                  Đang tải danh sách nộp bài...
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Chưa có ai nộp bài!
                </div>
              ) : (
                <table className="w-full text-sm mb-2 border">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 bg-gray-100">Học viên</th>
                      <th className="border px-2 py-1 bg-gray-100">
                        Thời gian nộp
                      </th>
                      <th className="border px-2 py-1 bg-gray-100">Tệp</th>
                      <th className="border px-2 py-1 bg-gray-100">Điểm</th>
                      <th className="border px-2 py-1 bg-gray-100">Nhận xét</th>
                      {isAdminOrTeacher && (
                        <th className="border px-2 py-1 bg-gray-100">
                          Hành động
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s._id}>
                        <td className="border px-2 py-1">
                          {s.studentId?.username ||
                            s.studentId?.name ||
                            "Không rõ"}
                        </td>
                        <td className="border px-2 py-1">
                          {new Date(s.submittedAt).toLocaleString()}
                        </td>
                        <td className="border px-2 py-1">
                          <button
                            onClick={() => downloadSubmission(s._id)}
                            className="text-blue-500 underline"
                          >
                            Tải file
                          </button>
                        </td>
                        {/* Cột "Điểm" */}
                        <td className="border px-2 py-1 text-center">
                          {isAdminOrTeacher && editId === s._id ? (
                            <div>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                className="border px-2 py-1 w-16"
                                value={editGrade}
                                onChange={handleGradeChange}
                              />
                              {gradeError && (
                                <div className="text-red-600 text-xs mt-1">
                                  {gradeError}
                                </div>
                              )}
                            </div>
                          ) : s.grade !== null ? (
                            s.grade
                          ) : (
                            <span className="text-yellow-600">Chưa chấm</span>
                          )}
                        </td>
                        {/* Cột "Nhận xét" */}
                        <td className="border px-2 py-1">
                          {isAdminOrTeacher && editId === s._id ? (
                            <input
                              className="border px-2 py-1 w-full"
                              value={editFeedback}
                              onChange={(e) => setEditFeedback(e.target.value)}
                            />
                          ) : (
                            s.feedback || ""
                          )}
                        </td>
                        {/* Cột "Hành động" */}
                        {isAdminOrTeacher && (
                          <td className="border px-2 py-1">
                            {editId === s._id ? (
                              <>
                                <button
                                  className="bg-green-600 text-white px-2 py-1 rounded mr-1"
                                  onClick={() => saveEdit(s._id)}
                                  disabled={!!gradeError}
                                >
                                  Lưu
                                </button>
                                <button
                                  className="bg-gray-400 text-white px-2 py-1 rounded"
                                  onClick={cancelEdit}
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <button
                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                onClick={() => startEdit(s)}
                              >
                                Sửa
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AssignmentSubmissionsList;
