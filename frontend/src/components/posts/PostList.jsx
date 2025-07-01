import React, { useState, useEffect } from "react";
import CommentSection from "./CommentSection";
import LikeButton from "./LikeButton";
import Pagination from "../layouts/Pagination";
import { createComment } from "../../services/commentService";
import UserAvatar from "../users/UserAvatar";
import { GoKebabHorizontal } from "react-icons/go";
import { toast } from "react-toastify";

const PAGE_SIZE = 5;

// Modal component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative p-6 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold z-20"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const truncate = (text, maxLength = 180) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
};

const PostList = ({
  posts: initialPosts, // Đổi tên để tránh nhầm lẫn với state posts cục bộ
  onEdit,
  onDelete,
  isAdmin,
  currentUser,
  viewMode,
  onOpenModal,
  onCloseModal,
  selectedPostId,
  detailPost,
  setShowCreateModal,
  onLikeUpdate: onLikeUpdateFromParent, // Đổi tên prop để tránh trùng với hàm cục bộ
}) => {
  // Đồng bộ hóa initialPosts với state posts cục bộ
  // Điều này là cần thiết để PostList có thể tự quản lý việc sửa/xóa/thích/bình luận
  const [posts, setPosts] = useState(initialPosts);

  // useEffect để cập nhật state `posts` khi `initialPosts` thay đổi từ component cha.
  // Đảm bảo so sánh để tránh vòng lặp nếu `initialPosts` thay đổi tham chiếu liên tục.
  useEffect(() => {
    // So sánh sâu hơn nếu các đối tượng trong mảng có thể giống nhau về nội dung nhưng khác về tham chiếu
    if (JSON.stringify(initialPosts) !== JSON.stringify(posts)) {
      setPosts(initialPosts);
    }
  }, [initialPosts, posts]); // Thêm 'posts' vào dependency để kiểm tra so sánh

  const [menuOpenPostId, setMenuOpenPostId] = useState(null);
  const [internalSelectedPost, setInternalSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState(""); // Có thể loại bỏ nếu chỉ dùng modalComment
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);

  const paginatedData = posts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // currentSelectedPost sẽ ưu tiên detailPost (từ URL) rồi mới đến internalSelectedPost
  const currentSelectedPost = selectedPostId
    ? detailPost
    : internalSelectedPost;

  const canEditOrDelete = (post) => {
    if (isAdmin) return true;
    if (!currentUser || !post.authorId) return false;
    if (typeof post.authorId === "object" && post.authorId._id) {
      return String(post.authorId._id) === String(currentUser._id);
    }
    return String(post.authorId) === String(currentUser._id);
  };

  const handleOpenLocalModal = (postId) => {
    // Tìm bài viết trong state posts cục bộ
    const post = posts.find((p) => p._id === postId);
    if (post) {
      setInternalSelectedPost(post);
      if (onOpenModal) onOpenModal(postId); // Thông báo cho HomePage về việc mở modal
    }
  };

  const handleCloseLocalModal = () => {
    setInternalSelectedPost(null);
    if (onCloseModal) onCloseModal(); // Thông báo cho HomePage về việc đóng modal
  };

  const handleMenuToggle = (postId) => {
    setMenuOpenPostId(menuOpenPostId === postId ? null : postId);
  };

  const handleMenuClose = () => {
    setMenuOpenPostId(null);
  };

  // Khởi tạo commentCounts một lần duy nhất khi component mount
  // Sau đó sẽ cập nhật riêng trong handleCommentAdded/Deleted
  const [commentCounts, setCommentCounts] = useState(() =>
    initialPosts.reduce(
      (acc, post) => ({ ...acc, [post._id]: post.commentsCount || 0 }),
      {}
    )
  );

  // Hàm cập nhật lượt thích. Hàm này được truyền xuống LikeButton.
  // Quan trọng: Nó sẽ cập nhật state `posts` cục bộ của PostList
  // VÀ gọi `onLikeUpdateFromParent` để HomePage cập nhật state `posts` của nó.
  const handleLikeUpdate = (postId, liked, newLikesCount, newLikedUsers) => {
    // 1. Cập nhật state posts cục bộ
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: newLikedUsers,
              likesCount: newLikesCount,
            }
          : p
      )
    );

    // 2. Cập nhật internalSelectedPost nếu modal đang mở
    if (internalSelectedPost && internalSelectedPost._id === postId) {
      setInternalSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              likes: newLikedUsers,
              likesCount: newLikesCount,
            }
          : prev
      );
    }

    // 3. Thông báo cho component cha (HomePage) để nó cập nhật state `posts` của riêng nó
    // HomePage sẽ nhận `postId`, `liked` (true/false), `newLikesCount`, `newLikedUsers`
    if (onLikeUpdateFromParent) {
      onLikeUpdateFromParent(postId, liked, newLikesCount, newLikedUsers);
    }
  };

  // Hàm này được gọi khi có bình luận mới được thêm vào
  const handleCommentAdded = (postId) => {
    setCommentCounts((prev) => {
      const newCount = (prev[postId] || 0) + 1;
      // Tránh cập nhật state nếu số lượng không đổi để tránh re-render không cần thiết
      if (newCount !== prev[postId]) {
        return {
          ...prev,
          [postId]: newCount,
        };
      }
      return prev;
    });

    // Cập nhật post trong danh sách posts (để cập nhật số comment hiển thị)
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId
          ? {
              ...p,
              commentsCount: (p.commentsCount || 0) + 1,
            }
          : p
      )
    );

    // Cập nhật currentSelectedPost nếu đang mở modal
    if (currentSelectedPost && currentSelectedPost._id === postId) {
      setInternalSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: (prev.commentsCount || 0) + 1,
            }
          : prev
      );
    }
  };

  // Hàm này được gọi khi có bình luận bị xóa
  const handleCommentDeleted = (postId) => {
    setCommentCounts((prev) => {
      const newCount = Math.max(0, (prev[postId] || 0) - 1);
      // Tránh cập nhật state nếu số lượng không đổi
      if (newCount !== prev[postId]) {
        return {
          ...prev,
          [postId]: newCount,
        };
      }
      return prev;
    });

    // Cập nhật post trong danh sách posts
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId
          ? {
              ...p,
              commentsCount: Math.max(0, (p.commentsCount || 0) - 1),
            }
          : p
      )
    );

    // Cập nhật currentSelectedPost nếu đang mở modal
    if (currentSelectedPost && currentSelectedPost._id === postId) {
      setInternalSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: Math.max(0, (prev.commentsCount || 0) - 1),
            }
          : prev
      );
    }
  };

  // Comment input handlers for modal
  const [modalComment, setModalComment] = useState("");
  const [reloadCommentKey, setReloadCommentKey] = useState(0);

  const handleModalCommentAdd = async () => {
    if (!modalComment.trim() || !currentSelectedPost || !currentUser) return;
    try {
      await createComment({
        post: currentSelectedPost._id,
        content: modalComment,
        author: currentUser._id,
      });
      setModalComment("");
      setReloadCommentKey((k) => k + 1); // Kích hoạt CommentSection reload
      handleCommentAdded(currentSelectedPost._id); // Cập nhật số lượng bình luận
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Không thể thêm bình luận!");
    }
  };

  // time
  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} ngày trước`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} giờ trước`;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins > 0) return `${mins} phút trước`;
    return "Vừa xong";
  };

  // Chức năng chia sẻ
  const handleShare = (post) => {
    const postUrl = window.location.origin + "/posts/" + (post._id || post.id);
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(postUrl)
        .then(() => {
          toast.success("Đã sao chép liên kết bài viết vào clipboard!");
        })
        .catch(() => {
          toast.error("Không thể sao chép liên kết, vui lòng thử lại!");
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Đã sao chép liên kết bài viết vào clipboard!");
      } catch (err) {
        toast.error(
          "Không thể sao chép liên kết, vui lòng copy thủ công: " + postUrl
        );
      }
      document.body.removeChild(textArea);
    }
  };

  // --- VIEWS ---
  const renderAdminTable = () => (
    <div className="bg-white shadow-lg rounded-lg p-6 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Quản lý bài viết
        </h1>
        {setShowCreateModal && (
          <button
            onClick={() => {
              setShowCreateModal(true);
              setCurrentPage(1);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thêm bài viết
          </button>
        )}
      </div>
      {paginatedData.length === 0 ? (
        <p className="text-gray-500 text-center">Chưa có bài viết nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold">
                  STT
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-center">
                  ID
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-center">
                  Tác giả
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-center">
                  Ngày đăng
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((post, index) => (
                <tr
                  key={post._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    {post._id}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    {post.author}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    {new Date(post.createdAt).toLocaleString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(post)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(post._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );

  const renderUserList = () => (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-6 text-gray-800 text-left dark:text-white">
        📌 Bài đăng gần đây
      </h1>

      <div className="flex flex-col gap-6">
        {paginatedData.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có bài viết nào.</p>
        ) : (
          paginatedData.map((post) => (
            // card bài viết
            <div
              key={post._id}
              className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 w-full max-w-[986px] mx-auto relative cursor-pointer"
              onClick={() => handleOpenLocalModal(post._id)} // Gọi hàm mở modal cục bộ
            >
              {/* card bài viết 3 phần */}
              <div className="mb-4">
                {/* phần 1: header, chứa logo avatar, author, scope, time */}
                <div className="flex items-center justify-between px-6 pt-1 pb-2 relative border-b mb-3">
                  {/* left-header: avatar, author,time */}
                  {/* 3 phần */}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <UserAvatar
                      user={post.authorId}
                      size="h-10 w-9 rounded-full ring-2 ring-blue-500 dark:ring-blue-300"
                    />

                    {/* Thông tin tác giả và thời gian */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {/* dòng 1: author */}
                        <span className="font-semibold text-base text-gray-800 dark:text-white">
                          {/* {post.authorId.username} */}
                        </span>
                        {/* Scope/Label vẫn để ngang hàng ở đây */}
                        <div className="">
                          {post.scope === "public" ? (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs flex items-center ml-2">
                              <i className="fas fa-globe"></i>
                              Tất cả
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {post.classId && (
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs flex items-center">
                                  <i className="fas fa-graduation-cap mr-1"></i>
                                  {post.classId.nameClass || post.classId.name}
                                </span>
                              )}
                              {post.groupId && (
                                <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs flex items-center">
                                  <i className="fas fa-users mr-1"></i>
                                  {post.groupId.nameGroup || post.groupId.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* dòng 2: time */}
                      <span className="text-xs text-gray-400 flex items-center">
                        <i className="fas fa-clock mr-1"></i>
                        {getTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* right-header: Kebab nút sửa xóa */}
                  <div className=" right-4 top-4">
                    {canEditOrDelete(post) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuToggle(post._id);
                        }}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none text-2xl"
                      >
                        <GoKebabHorizontal />
                      </button>
                    )}
                    {canEditOrDelete(post) && menuOpenPostId === post._id && (
                      <div
                        className="absolute right-0 top-8 bg-white shadow-lg rounded-md p-2 w-32 z-10"
                        onMouseLeave={handleMenuClose}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(post);
                          }}
                          className="block text-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 px-4 py-2 w-full text-left dark:text-white"
                        >
                          <i className="fas fa-edit mr-1"></i> Sửa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(post._id);
                          }}
                          className="block text-red-600 dark:hover:bg-gray-800 hover:bg-gray-100 px-4 py-2 w-full text-left"
                        >
                          <i className="fas fa-trash mr-1"></i> Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* phần 2: title, content */}
                <div className="border-b pb-3 mb-3 pl-6">
                  {/* title */}
                  <h2 className="text-2xl font-semibold text-gray-800 text-left dark:text-white">
                    {post.title}
                  </h2>
                  {/* content */}
                  <p
                    className="text-gray-600 dark:text-white mb-4 text-left line-clamp-4 break-words"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      wordBreak: "break-word",
                      minHeight: "5.5em",
                      maxHeight: "6.5em",
                    }}
                  >
                    {truncate(post.content, 350)}
                  </p>
                </div>

                {/* phần 3: like, comment */}
                <div className="flex items-center pl-6 w-full">
                  {/* Like Button */}
                  <div className="flex-1 flex justify-center">
                    <LikeButton
                      post={post}
                      currentUser={currentUser}
                      onLikeUpdate={(liked, likesCount, likedUsers) =>
                        handleLikeUpdate(
                          post._id,
                          liked,
                          likesCount,
                          likedUsers
                        )
                      }
                    />
                  </div>
                  {/* Divider */}
                  <div className="h-8 border-l border-gray-300 mx-2" />

                  {/* bình luận */}
                  <div className="flex-1 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLocalModal(post._id); // Vẫn gọi hàm mở modal cục bộ
                      }}
                      className="flex items-center hover:text-blue-500 transition-colors"
                    >
                      <i className="fas fa-comment text-lg"></i>
                      <span className="ml-1">
                        {commentCounts[post._id] || 0} bình luận
                      </span>
                    </button>
                  </div>
                  {/* Divider */}
                  <div className="h-8 border-l border-gray-300 mx-2" />
                  {/* Nút share */}
                  <div className="flex-1 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(post);
                      }}
                      className="flex items-center hover:text-green-600 transition-colors"
                      title="Chia sẻ"
                    >
                      <i className="fas fa-share-alt text-lg"></i>
                      <span className="ml-1 hidden sm:inline">Chia sẻ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* MODAL CHI TIẾT BÀI VIẾT */}
      {/* Sử dụng currentSelectedPost để quyết định mở/đóng modal */}
      <Modal open={!!currentSelectedPost} onClose={handleCloseLocalModal}>
        {currentSelectedPost && (
          <div>
            {/* header */}
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 ">
              {/* Avatar */}
              <UserAvatar
                user={currentSelectedPost.authorId}
                size="h-10 w-9 rounded-full ring-2 ring-blue-500 dark:ring-blue-300"
              />

              {/* Thông tin tác giả và thời gian */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {/* dòng 1: author */}
                  <span className="font-semibold text-base text-gray-800 dark:text-white">
                    {currentSelectedPost.authorId.username}
                  </span>
                  {/* Scope/Label vẫn để ngang hàng ở đây */}
                  <div className="">
                    {currentSelectedPost.scope === "public" ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs flex items-center ml-2">
                        <i className="fas fa-globe"></i>
                        Tất cả
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {currentSelectedPost.classId && (
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs flex items-center">
                            <i className="fas fa-graduation-cap mr-1"></i>
                            {currentSelectedPost.classId.nameClass ||
                              currentSelectedPost.classId.name}
                          </span>
                        )}
                        {currentSelectedPost.groupId && (
                          <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs flex items-center">
                            <i className="fas fa-users mr-1"></i>
                            {currentSelectedPost.groupId.nameGroup ||
                              currentSelectedPost.groupId.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* dòng 2: time */}
                <span className="text-xs text-gray-400 flex items-center">
                  <i className="fas fa-clock mr-1"></i>
                  {getTimeAgo(currentSelectedPost.createdAt)}
                </span>
              </div>
            </div>

            {/* title, like, comment */}
            <div className="px-5 py-4 border-b border-gray-200 mb-6 ">
              {/* title */}
              <div className="mb-3 text-gray-900 dark:text-gray-100 whitespace-pre-line break-words">
                <h2 className="text-2xl font-semibold text-gray-800 text-left dark:text-white ">
                  {currentSelectedPost.title}
                </h2>
                {currentSelectedPost.content}
              </div>

              {/* like, comment */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300 mb-2">
                <LikeButton
                  post={currentSelectedPost} // Truyền currentSelectedPost vào LikeButton
                  currentUser={currentUser}
                  // Sửa thứ tự đối số để khớp với LikeButton mới
                  onLikeUpdate={(liked, likesCount, likedUsers) =>
                    handleLikeUpdate(
                      currentSelectedPost._id,
                      liked, // Đã thích hay chưa
                      likesCount, // Tổng số lượt thích
                      likedUsers // Mảng người dùng đã thích
                    )
                  }
                />
                <div className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition-colors">
                  <i className="fas fa-comment"></i>
                  <span>
                    {commentCounts[currentSelectedPost._id] || 0} bình luận
                  </span>
                </div>
              </div>
            </div>

            {/* Bình luận - chỉ danh sách */}
            <CommentSection
              refreshKey={reloadCommentKey}
              postId={currentSelectedPost._id}
              currentUser={currentUser}
              onCommentAdded={() => handleCommentAdded(currentSelectedPost._id)}
              onCommentDeleted={() =>
                handleCommentDeleted(currentSelectedPost._id)
              }
            />
            {/* Ô nhập bình luận luôn dính dưới bài viết */}
            <div className="bg-white p-3 border-t mt-2 sticky bottom-0 z-10">
              <div className="flex">
                <input
                  type="text"
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleModalCommentAdd();
                    }
                  }}
                  className="flex-1 border rounded-l px-3 py-1"
                  placeholder="Viết bình luận..."
                />
                <button
                  onClick={handleModalCommentAdd}
                  className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  return viewMode === "admin" ? renderAdminTable() : renderUserList();
};

export default PostList;
