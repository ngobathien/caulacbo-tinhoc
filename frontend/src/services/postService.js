import api from "./apiClient";

// API Like/Unlike bài viết
export const likePost = async (postId) => {
  try {
    const response = await api.patch(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

// Fetch all posts
export const getPost = async () => {
  try {
    const response = await api.get("/posts");
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Lấy 1 bài viết theo id
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post by id:", error);
    // Ném lỗi với thông tin chi tiết hơn để frontend có thể bắt được
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.message || "Lỗi không xác định từ server",
      };
    } else {
      // Lỗi mạng hoặc không kết nối được server
      throw {
        status: 500, // Hoặc một mã lỗi khác nếu bạn muốn phân biệt lỗi mạng
        message:
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      };
    }
  }
};

// Create a new post
export const createPost = async (newPost) => {
  try {
    const response = await api.post("/posts", newPost);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Update an existing post
export const updatePost = async (postId, updatedPost) => {
  try {
    const response = await api.put(`/posts/${postId}`, updatedPost);
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};
