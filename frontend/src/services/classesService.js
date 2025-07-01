import api from "./apiClient";

// Lấy tất cả lớp học
export const getClass = async () => {
  try {
    const response = await api.get("/classes");
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Lấy danh sách lớp học mà một người dùng (userId) đã tham gia (không cần token)
export const getUserClasses = async (userId) => {
  try {
    const res = await api.get(`/classes/user/${userId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching user's classes:", error);
    return [];
  }
};

// Tạo lớp học mới
export const createClass = async (classData) => {
  try {
    const response = await api.post("/classes", classData);
    return response.data;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

// Cập nhật lớp học
export const updateClass = async (classId, updatedClass) => {
  try {
    const response = await api.put(`/classes/${classId}`, updatedClass);
    return response.data;
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

// Xóa lớp học
export const deleteClass = async (classId) => {
  try {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

// Xem chi tiết một lớp học
export const viewClass = async (classId) => {
  try {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error viewing class:", error);
    throw error;
  }
};

// Tham gia lớp học
export const joinClass = async (classId) => {
  try {
    const response = await api.post(`/classes/join/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error joining class:", error);
    throw error;
  }
};

// Rời lớp học
export const leaveClass = async (classId) => {
  try {
    const response = await api.post(`/classes/leave/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error leaving class:", error);
    throw error;
  }
};

// Lấy thành viên của 1 lớp học
export const getClassMembers = async (classId) => {
  try {
    const response = await api.get(`/classes/${classId}/members`);
    return response.data; // [{_id, username, email, role}]
  } catch (error) {
    console.error("Error fetching class members:", error);
    throw error;
  }
};

// Xóa thành viên khỏi lớp học (chỉ admin)
export const removeMemberFromClass = async (classId, userId) => {
  try {
    const response = await api.delete(`/classes/${classId}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing member from class:", error);
    throw error;
  }
};
