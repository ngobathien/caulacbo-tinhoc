import React, { useEffect, useState, useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UpdateGroup({ onUpdateGroup, isOpen, onClose, groupData }) {
  const [nameGroup, setNameGroup] = useState("");
  const [description, setDescription] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    if (groupData) {
      setNameGroup(groupData.nameGroup ?? "");
      setDescription(groupData.description ?? "");
    } else {
      setNameGroup("");
      setDescription("");
    }
  }, [groupData]);

  // Đóng modal khi click ra ngoài
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

  const handleUpdateGroup = () => {
    if (!nameGroup.trim()) return;
    onUpdateGroup(groupData._id, { nameGroup, description });
    onClose();
  };

  // Xử lý Enter để lưu
  const handleKeyDown = (e) => {
    if (
      (e.target.id === "updateGroupName" && e.key === "Enter") ||
      (e.target.id === "updateGroupDescription" &&
        e.key === "Enter" &&
        !e.shiftKey)
    ) {
      e.preventDefault();
      handleUpdateGroup();
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div
        id="updateGroupModal"
        className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
      >
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
            Cập nhật nhóm
          </h3>
          <div className="space-y-3">
            {/* tên nhóm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                Tên nhóm
              </label>
              <input
                id="updateGroupName"
                value={nameGroup}
                onChange={(e) => setNameGroup(e.target.value)}
                type="text"
                className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                Mô tả
              </label>
              <textarea
                id="updateGroupDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded h-24 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                onKeyDown={handleKeyDown}
              ></textarea>
              <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">
                Nhấn <b>Enter</b> để lưu, <b>Shift+Enter</b> để xuống dòng
              </div>
            </div>
            <input type="hidden" id="updateGroupId" />
            <div className="flex justify-end space-x-2 pt-4">
              {/* nút hủy */}
              <button
                onClick={onClose}
                id="cancelUpdateGroup"
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded"
              >
                Hủy
              </button>

              {/* nút lưu */}
              <button
                onClick={handleUpdateGroup}
                id="confirmUpdateGroup"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateGroup;
