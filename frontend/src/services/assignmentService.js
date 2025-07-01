import api from "./apiClient";

// Lấy danh sách assignment (optionally theo classId)
export const getAssignments = async (classId) => {
  const params = classId ? { classId } : {};
  const res = await api.get("/assignments", { params });
  return res.data;
};

// Lấy assignment theo id
export const getAssignment = async (id) => {
  const res = await api.get(`/assignments/${id}`);
  return res.data;
};

// Tạo assignment mới
export const createAssignment = async (data) => {
  const res = await api.post("/assignments", data);
  return res.data;
};

// Cập nhật assignment
export const updateAssignment = async (id, data) => {
  const res = await api.put(`/assignments/${id}`, data);
  return res.data;
};

// Xóa assignment
export const deleteAssignment = async (id) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};
