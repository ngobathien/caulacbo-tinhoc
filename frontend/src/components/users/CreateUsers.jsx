import React, { useEffect, useState } from "react";

const CreateUser = ({ onSubmit, onClose, initialData }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username);
      setEmail(initialData.email);
      setRole(initialData.role);
      setPassword(""); // Không hiển thị mật khẩu cũ
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;

    const userData = { username, email, role };

    if (initialData) {
      userData.id = initialData._id; // Thêm ID vào dữ liệu cập nhật
    }
    if (password.trim()) {
      userData.password = password; // Cho phép cập nhật mật khẩu nếu có
    }

    await onSubmit(userData);
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("user");
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Cập nhật người dùng" : "Thêm người dùng"}
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Hiển thị ID nếu cập nhật */}
        {initialData && (
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2 dark:text-white">
              ID
            </label>
            <input
              type="text"
              value={initialData._id}
              className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2 dark:text-white">
            Tên
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Nhập tên người dùng"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2 dark:text-white">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Nhập email"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2 dark:text-white">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Nhập mật khẩu"
            required={!initialData} // Bắt buộc nếu là tạo mới
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2 dark:text-white">
            Vai trò
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {initialData ? "Cập nhật" : "Tạo"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateUser;
