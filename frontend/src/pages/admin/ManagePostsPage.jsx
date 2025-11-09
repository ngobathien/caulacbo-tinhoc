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
    // Sử dụng min-h-screen để đảm bảo nền xám bao phủ toàn bộ, thêm padding trên mobile (sm:p-8)
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6 flex flex-col items-center">
      {/* Container chính cho nội dung (Thay w-[986px] bằng w-full và max-w-5xl) */}
      <div className="w-full max-w-5xl mb-6">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            {" "}
            {/* Thêm p-4 cho padding trên mobile */}
            {/* Tối ưu hóa width: w-full, max-w-xs trên mobile nhỏ, max-w-md trên tablet */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md relative">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Tạo bài viết mới
              </h2>
              <CreatePost onCreate={handleCreatePost} />
              <button
                onClick={() => setShowCreateModal(false)}
                className="mt-4 bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition duration-200 ease-in-out w-full" // w-full trên mobile để dễ bấm
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Container cho PostList */}
      <div className="w-full max-w-5xl">
        <PostList
          isAdmin={true}
          viewMode="admin"
          posts={posts}
          onDelete={handleDeletePost}
          onEdit={(post) => setEditingPost(post)}
          onCreate={handleCreatePost}
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          currentUser={null}
        />
      </div>
    </div>
  );
}

export default ManagePostsPage;
