import api from "./apiClient";

// Lấy danh sách người dùng
export const getCount = async () => {
  try {
    const response = await api.get("/counts/all");

    return response.data;
  } catch (error) {
    console.error("Lỗi count dữ liệu:", error);
    throw error;
  }
};
