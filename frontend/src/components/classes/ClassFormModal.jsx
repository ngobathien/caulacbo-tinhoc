import React, { useState, useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify"; // Đảm bảo import ToastContainer

// `mode` có thể là 'create' hoặc 'edit'
// `initialData` chứa { nameClass, description, _id } khi mode là 'edit'
function ClassFormModal({ isOpen, onClose, onSubmit, mode, initialData }) {
  const [nameClass, setNameClass] = useState("");
  const [description, setDescription] = useState("");
  const formRef = useRef(null);
  const modalRef = useRef(null);

  // Gắn dữ liệu vào form khi modal mở hoặc mode/initialData thay đổi
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setNameClass(initialData.nameClass || "");
      setDescription(initialData.description || "");
    } else {
      // Reset form khi ở chế độ tạo hoặc không có initialData
      setNameClass("");
      setDescription("");
    }
  }, [isOpen, mode, initialData]); // Thêm isOpen vào dependency array để reset khi mở

  // Đóng khi click ra ngoài modal
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault(); // Ngăn submit form mặc định

    if (!nameClass.trim()) {
      alert("Tên lớp học không được để trống!"); // Có thể thay bằng toast
      return;
    }

    // Gọi hàm onSubmit từ component cha.
    // Component cha sẽ truyền vào ID nếu là sửa.
    onSubmit({ nameClass, description });
    // Không đóng modal ở đây, để component cha quyết định đóng sau khi API gọi thành công
  };

  const handleKeyDown = (e) => {
    if (
      (e.target.name === "nameClass" && e.key === "Enter") ||
      (e.target.name === "description" && e.key === "Enter" && !e.shiftKey)
    ) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
      }
    }
  };

  if (!isOpen) return null; // Không render gì nếu modal không mở

  return (
    <>
      {/* ToastContainer có thể đặt ở cấp cao hơn (ví dụ: App.js) để tránh trùng lặp */}
      {/* <ToastContainer /> */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          ref={modalRef}
        >
          {/* Nút X thoát */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white text-2xl font-bold focus:outline-none"
            aria-label="Đóng"
            type="button"
          >
            &times;
          </button>
          <h3 className="text-xl font-bold mb-4 dark:text-white">
            {mode === "edit" ? "Cập nhật lớp học" : "Thêm lớp học mới"}
          </h3>
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="space-y-3">
              {/* Tên lớp học */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                  Tên lớp học
                </label>
                <input
                  name="nameClass"
                  type="text"
                  value={nameClass}
                  onChange={(e) => setNameClass(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  required
                />
              </div>

              {/* mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                  Mô tả (không bắt buộc)
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mô tả lớp học"
                  className="w-full px-3 py-2 border rounded h-24 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                ></textarea>
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">
                  Nhấn **Enter** để lưu (Shift+Enter để xuống dòng)
                </div>
              </div>

              {/* nút */}
              <div className="flex justify-end space-x-2 pt-4">
                {/* nút hủy */}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded"
                >
                  Hủy
                </button>

                {/* nút lưu */}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {mode === "edit" ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ClassFormModal;
