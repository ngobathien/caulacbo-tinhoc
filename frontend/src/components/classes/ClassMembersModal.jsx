import React, { useRef, useEffect } from "react";

function ClassMembersModal({
  isOpen,
  onClose,
  members,
  classesName,
  onRemoveMember,
  isAdmin,
}) {
  const modalRef = useRef(null);

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

  if (!isOpen) return null;

  return (
    // <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl shadow-lg p-6 relative"
        ref={modalRef}
      >
        {/* Nút đóng modal */}
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition"
          onClick={onClose}
        >
          <i className="fas fa-times text-lg"></i>
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 dark:text-white">
          <i className="fas fa-users text-blue-500"></i>
          Thành viên lớp {classesName}
        </h2>

        {/* Bảng thành viên với chiều rộng linh hoạt */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] max-w-full border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border p-3 text-left w-[30%]">Tên</th>
                <th className="border p-3 text-left w-[30%]">Email</th>
                <th className="border p-3 text-left w-[20%]">Vai trò</th>
                {isAdmin && <th className="border p-3 w-[20%]">Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {members && members.length > 0 ? (
                members.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="border p-3">{user.username}</td>
                    <td className="border p-3">{user.email}</td>
                    <td className="border p-3">{user.role}</td>
                    {isAdmin && user.role !== "admin" && (
                      <td className="border p-3 text-center">
                        <button
                          onClick={() => onRemoveMember(user._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                        >
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isAdmin ? 4 : 3}
                    className="border p-3 text-center text-gray-500 dark:text-gray-300"
                  >
                    Chưa có thành viên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClassMembersModal;
