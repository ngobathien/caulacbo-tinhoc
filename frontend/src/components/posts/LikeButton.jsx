import React, { useState, useEffect } from "react";
import { likePost } from "../../services/postService";

const LikeButton = ({ post, currentUser, onLikeUpdate }) => {
  // isLiked và likesCount bây giờ sẽ là state cục bộ của component
  // và chúng sẽ được khởi tạo dựa trên prop post ban đầu.
  // Quan trọng: Chúng ta sẽ cập nhật chúng thông qua handleLike,
  // chứ không phải dựa vào useEffect để tránh vòng lặp.
  const [isLiked, setIsLiked] = useState(
    Array.isArray(post.likes) && currentUser
      ? post.likes.includes(currentUser._id)
      : false
  );
  const [likesCount, setLikesCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : post.likesCount || 0
  );

  const [loading, setLoading] = useState(false);

  // useEffect này chỉ chạy MỘT LẦN khi component mount
  // để khởi tạo giá trị ban đầu. Nó không cần 'post' hay 'currentUser'
  // trong dependency array nữa, vì chúng ta đã khởi tạo state trực tiếp.
  // Hạn chế việc setState liên tục dựa trên prop post.
  // Hoặc nếu muốn cập nhật khi prop 'post' thay đổi từ bên ngoài,
  // bạn cần đảm bảo component cha không gửi 'post' với tham chiếu mới liên tục.
  // Trong trường hợp này, việc khởi tạo ban đầu là đủ nếu onLikeUpdate xử lý tốt.
  useEffect(() => {
    // Chỉ cần cập nhật nếu giá trị hiện tại khác với prop
    // Điều này giúp tránh render không cần thiết nếu post không thay đổi
    const initialLiked =
      Array.isArray(post.likes) && currentUser
        ? post.likes.includes(currentUser._id)
        : false;
    const initialLikesCount = Array.isArray(post.likes)
      ? post.likes.length
      : post.likesCount || 0;

    if (initialLiked !== isLiked) {
      setIsLiked(initialLiked);
    }
    if (initialLikesCount !== likesCount) {
      setLikesCount(initialLikesCount);
    }
  }, [post, currentUser]); // GIỮ post và currentUser Ở ĐÂY là đúng

  // GIẢI THÍCH:
  // Vấn đề thường xảy ra là component cha cập nhật props (post) MỖI LẦN RENDER,
  // kể cả khi dữ liệu bên trong 'post' không thay đổi.
  // Điều này khiến useEffect chạy lại, setState, gây ra vòng lặp.
  // Giải pháp là:
  // 1. Trong component cha, khi truyền `post` xuống, đảm bảo `post` chỉ thay đổi
  //    tham chiếu khi dữ liệu *thực sự* thay đổi.
  //    Ví dụ: const updatedPosts = posts.map(p => p._id === postId ? { ...p, likes: newLikesArray } : p);
  //    Chứ không phải tạo lại toàn bộ mảng posts nếu chỉ 1 bài thay đổi.
  // 2. Trong LikeButton, useEffect này là cần thiết để cập nhật state cục bộ
  //    khi prop `post` thay đổi TỪ BÊN NGOÀI (ví dụ, khi bài viết được tải lần đầu hoặc
  //    cập nhật từ một nguồn khác không phải do `handleLike` trong chính component này).
  //    Vòng lặp xảy ra khi `post` trong dependency array liên tục được coi là "thay đổi"
  //    ngay cả khi nó không nên.

  const handleLike = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await likePost(post._id); // API call

      // Cập nhật state cục bộ của LikeButton dựa trên kết quả API
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);

      // Gọi onLikeUpdate để thông báo cho component cha
      if (onLikeUpdate) {
        // updatedLikes là một mảng mới được tạo ra dựa trên logic like/unlike
        // Đây là thông tin quan trọng mà component cha cần để cập nhật state posts của nó.
        const updatedLikesArray = Array.isArray(post.likes)
          ? res.liked
            ? [...post.likes, currentUser._id].filter(
                (id, index, self) => self.indexOf(id) === index
              ) // Thêm ID một cách duy nhất
            : post.likes.filter((id) => id !== currentUser._id) // Xóa ID
          : res.liked
          ? [currentUser._id]
          : [];

        onLikeUpdate(post._id, res.liked, res.likesCount, updatedLikesArray); // Truyền post._id
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
    setLoading(false);
  };

  return (
    <button
      className={`flex items-center gap-1 px-2 py-1 rounded transition ${
        isLiked ? "text-blue-600 font-bold" : "text-gray-400"
      }`}
      disabled={loading}
      onClick={handleLike}
      title={isLiked ? "Bỏ thích" : "Thích"}
      type="button"
    >
      <i className={`fa${isLiked ? "s" : "r"} fa-thumbs-up`}></i>
      <span className="ml-1">{likesCount}</span>
      <span className="ml-1">{isLiked ? "Đã thích" : "Thích"}</span>
    </button>
  );
};

export default LikeButton;
