import React, { useEffect, useState } from "react";
import PostList from "../../components/posts/PostList";
import EditPost from "../../components/posts/EditPost";
import CreatePost from "../../components/posts/CreatePost";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
} from "../../services/postService";

function ManagePostsPage() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPost();
        setPosts(data);
      } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await createPost(postData);
      setPosts((prev) => [newPost, ...prev]);
      setShowCreateModal(false); // Đóng modal sau khi tạo bài viết
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error.message);
    }
  };

  const handleUpdatePost = async (postId, updatedPost) => {
    try {
      const updated = await updatePost(postId, updatedPost);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, ...updated } : post
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Lỗi khi xóa:", error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 flex flex-col items-center">
      <div className="w-[986px] mb-6">
        {/* Hiển thị EditPost khi đang chỉnh sửa */}
        {editingPost && (
          <EditPost
            editingPost={editingPost}
            onUpdate={handleUpdatePost}
            setEditingPost={setEditingPost}
          />
        )}

        {/* Modal CreatePost */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md relative">
              <h2 className="text-xl font-semibold mb-4">Tạo bài viết mới</h2>
              <CreatePost onCreate={handleCreatePost} />
              <button
                onClick={() => setShowCreateModal(false)}
                className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200 ease-in-out"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-[986px]">
        <PostList
          isAdmin={true}
          viewMode="admin"
          posts={posts}
          onDelete={handleDeletePost}
          onEdit={(post) => setEditingPost(post)}
          onCreate={handleCreatePost}
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          currentUser={null} // Thêm currentUser nếu cần kiểm tra quyền
        />
      </div>
    </div>
  );
}

export default ManagePostsPage;
