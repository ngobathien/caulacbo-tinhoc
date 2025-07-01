import React, { useState, useEffect } from "react";
import {
  getComment,
  createComment,
  updateComment,
  deleteComment as deleteCommentApi,
} from "../../services/commentService";
import UserAvatar from "../users/UserAvatar";

function CommentSection({
  refreshKey,
  postId,
  currentUser,
  onCommentAdded,
  onCommentDeleted,
}) {
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // id comment đang được reply
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [postId, refreshKey]);

  const fetchComments = async () => {
    const response = await getComment(postId);
    setComments(response.data || response);
  };

  // Thêm phản hồi
  const handleReplyComment = async (parentCommentId) => {
    if (!replyContent.trim()) return;
    await createComment({
      post: postId,
      content: replyContent,
      author: currentUser._id,
      reply: parentCommentId,
    });
    await fetchComments();
    setReplyingTo(null);
    setReplyContent("");
    if (onCommentAdded) onCommentAdded();
  };

  // Xóa bình luận
  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bình luận này?"
    );
    if (!confirmDelete) return;
    await deleteCommentApi(commentId);
    await fetchComments();
    if (onCommentDeleted) onCommentDeleted();
  };

  const startEditComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditedContent(content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  const saveEditComment = async (commentId) => {
    await updateComment(commentId, { content: editedContent });
    await fetchComments();
    setEditingCommentId(null);
    setEditedContent("");
  };

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

  // Xây dựng cây bình luận lồng nhau
  const buildCommentTree = () => {
    const map = {};
    comments.forEach((c) => (map[c._id] = { ...c, replies: [] }));
    const roots = [];
    comments.forEach((c) => {
      if (c.reply) {
        const parentId = typeof c.reply === "string" ? c.reply : c.reply?._id;
        if (map[parentId]) {
          map[parentId].replies.push(map[c._id]);
        }
      } else {
        roots.push(map[c._id]);
      }
    });
    return roots;
  };

  // Đệ quy render comment + reply
  const renderComment = (comment, level = 0) => {
    const canModify =
      currentUser &&
      (comment.author?._id === currentUser._id || currentUser.role === "admin");
    return (
      <div key={comment._id} className={level ? "ml-8" : ""}>
        <div className="flex items-start gap-3 py-2 px-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
          <UserAvatar user={comment.author} size="h-8 w-8" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {comment.author?.name || comment.author?.username || "Unknown"}
              </span>
              <span className="text-xs text-gray-500">
                {/* {formatDate(comment.createdAt)} */}
                {getTimeAgo(comment.createdAt)}
              </span>
            </div>
            {editingCommentId === comment._id ? (
              <div className="mt-2">
                <textarea
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows="2"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveEditComment(comment._id);
                    }
                  }}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={cancelEditComment}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => saveEditComment(comment._id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-1">{comment.content}</p>
            )}
            <div className="flex gap-3 mt-1">
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={() =>
                  setReplyingTo(replyingTo === comment._id ? null : comment._id)
                }
              >
                Phản hồi
              </button>
              {canModify && (
                <>
                  <button
                    onClick={() =>
                      startEditComment(comment._id, comment.content)
                    }
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
            {/* Form phản hồi */}
            {replyingTo === comment._id && (
              <div className="mt-2">
                <textarea
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={2}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập phản hồi..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReplyComment(comment._id);
                    }
                  }}
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleReplyComment(comment._id)}
                  >
                    Gửi
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-800"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6">
      {buildCommentTree().map((comment) => renderComment(comment))}
    </div>
  );
}

export default CommentSection;
