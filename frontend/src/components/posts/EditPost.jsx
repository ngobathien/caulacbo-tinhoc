import { useState, useEffect, useRef } from "react";

function EditPost({ editingPost, onUpdate, setEditingPost }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const formRef = useRef(null);

  // Gắn dữ liệu bài viết vào form khi có bài viết được chỉnh sửa
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
    }
  }, [editingPost]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onUpdate(editingPost._id, {
      title,
      content,
    });
    setEditingPost(null);
  };

  const handleCancel = () => {
    setEditingPost(null);
  };

  // Nhấn Enter ở input hoặc textarea sẽ submit, trừ khi giữ Shift trong textarea
  const handleKeyDown = (e) => {
    if (
      (e.target.name === "title" && e.key === "Enter") ||
      (e.target.name === "content" && e.key === "Enter" && !e.shiftKey)
    ) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Chỉnh sửa bài đăng</h2>
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="mb-4">
            <input
              type="text"
              name="title"
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border rounded mb-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              name="content"
              placeholder="Nội dung bài đăng..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border rounded h-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
            <div className="text-xs text-gray-400 mt-1">
              Nhấn <b>Enter</b> để lưu (Shift+Enter để xuống dòng trong nội
              dung)
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;
