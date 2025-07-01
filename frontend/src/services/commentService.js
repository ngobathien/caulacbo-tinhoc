import api from "./apiClient";

// Lấy comment theo postId
export const getComment = async (postId) => {
  const response = await api.get("/comments", { params: { postId } });
  return response.data;
};

// Thêm comment (cần truyền đầy đủ author, post, content)
export const createComment = async (commentData) => {
  const response = await api.post("/comments", commentData);
  return response.data;
};

// Cập nhật comment
export const updateComment = async (commentId, updatedComment) => {
  const response = await api.put(`/comments/${commentId}`, updatedComment);
  return response.data;
};

// Xóa comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
