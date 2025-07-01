import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreateClass({ onCreate }) {
  const [nameClass, setNameClass] = useState("");
  const [description, setDescription] = useState("");
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameClass.trim()) {
      toast.warning("Tên lớp học không được để trống");
      return;
    }

    try {
      await onCreate({ nameClass, description });
      setNameClass("");
      setDescription("");
    } catch (error) {
      toast.error("Lỗi khi tạo lớp học");
      console.error(error);
    }
  };

  // Nhấn Enter ở input sẽ submit form, còn ở textarea thì phải giữ Shift+Enter mới xuống dòng, Enter thường sẽ submit
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

  return (
    <div className="lg:col-span-1">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Thêm lớp học mới
        </h3>
        <form className="space-y-3" onSubmit={handleSubmit} ref={formRef}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
              Tên lớp học
            </label>
            <input
              id="className"
              name="nameClass"
              type="text"
              value={nameClass}
              onChange={(e) => setNameClass(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tên lớp học"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
              Mô tả (không bắt buộc)
            </label>
            <textarea
              id="classDescription"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mô tả lớp học"
              className="w-full px-3 py-2 border rounded h-24"
            ></textarea>
            <div className="text-xs text-gray-400 mt-1">
              Nhấn <b>Enter</b> để gửi (Shift+Enter để xuống dòng)
            </div>
          </div>
          <button
            type="submit"
            id="addClassBtn"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            <i className="fas fa-plus mr-2"></i>Thêm lớp học
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default CreateClass;
