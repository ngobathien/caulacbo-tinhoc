import api from "./apiClient";

// Lấy danh sách người dùng
export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
};

// Tạo người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    throw error;
  }
};

// Cập nhật người dùng
export const updateUser = async (userId, userData) => {
  try {
    if (!userId) {
      throw new Error("ID người dùng không được xác định");
    }
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    throw error;
  }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    throw error;
  }
};

// Duyệt tài khoản người dùng (chỉ dành cho admin)
export const approveUser = async (userId) => {
  try {
    const response = await api.put(`/users/approve/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi duyệt tài khoản người dùng:", error);
    throw error;
  }
};
