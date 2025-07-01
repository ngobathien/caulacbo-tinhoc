import api from "./apiClient";

// Nộp bài (file: File object, assignmentId: string, nameClass: string, nameGroup: string, classId: string, groupId: string)
export const submitAssignment = async (
  assignmentId,
  file,
  nameClass,
  nameGroup,
  classId,
  groupId
) => {
  const formData = new FormData();
  formData.append("assignmentId", assignmentId);
  formData.append("nameClass", nameClass);
  formData.append("nameGroup", nameGroup);
  if (classId) formData.append("classId", classId);
  if (groupId) formData.append("groupId", groupId);
  formData.append("file", file);

  const res = await api.post("/submissions/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Xem bài nộp của mình
export const getMySubmission = async (assignmentId) => {
  const res = await api.get(`/submissions/my/${assignmentId}`);
  return res.data;
};

// Lấy tất cả bài nộp của một assignment
export const getSubmissionsOfAssignment = async (assignmentId) => {
  const res = await api.get(`/submissions/assignment/${assignmentId}`);
  return res.data;
};

// Chấm điểm
export const gradeSubmission = async (submissionId, grade, feedback) => {
  const res = await api.put(`/submissions/grade/${submissionId}`, {
    grade,
    feedback,
  });
  return res.data;
};

// Tải file
export const downloadSubmission = (submissionId) => {
  // Chỉ cần dùng baseURL từ env/apiClient
  const baseURL = api.defaults.baseURL || "";
  window.open(`${baseURL}/submissions/download/${submissionId}`);
};
