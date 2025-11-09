import React, { useEffect, useState } from "react";
import CreateUsers from "../../components/users/CreateUsers";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  approveUser, // Thêm hàm duyệt user
} from "../../services/userService";
import UsersList from "../../components/users/UsersList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // tạo user
  const handleCreateUser = async (userData) => {
    try {
      const response = await createUser(userData);
      const newUser = response.user;
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi khi tạo người dùng:", error);
    }
  };

  //sửa user
  const handleEditUser = async (updatedUser) => {
    try {
      const userId = updatedUser.id || updatedUser._id;
      if (!userId) throw new Error("Không tìm thấy ID người dùng");
      const res = await updateUser(userId, updatedUser);
      toast.success("Cập nhật thành công");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, ...updatedUser, _id: userId } : user
        )
      );
      setEditingUser(null);
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      toast.success("Lỗi khi cập nhật: " + error.message);
    }
  };

  // Duyệt user
  const handleApproveUser = async (userId) => {
    try {
      await approveUser(userId); // Gọi API duyệt user
      toast.success("Duyệt tài khoản thành công");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isApproved: true } : user
        )
      );
    } catch (error) {
      toast.error("Lỗi khi duyệt tài khoản");
    }
  };

  //xóa user
  const handleDeleteUser = async (userId) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa?");
    if (!confirm) return;
    try {
      await deleteUser(userId);
      alert("Đã xóa người dùng");
      fetchUsers();
    } catch (error) {
      alert("Lỗi khi xóa người dùng");
      console.error(error);
    }
  };

  return (
    // Điều chỉnh padding ngang từ mobile (px-4) lên desktop (px-8, px-12, etc.)
    // Giữ nguyên py-8 và mt-6 để đảm bảo khoảng cách với Header (nếu có)
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 mt-6">
      <UsersList
        users={users}
        onDeleteUser={handleDeleteUser}
        onEditUser={(user) => {
          setEditingUser(user);
          setShowForm(true);
        }}
        onShowCreateUser={() => {
          setEditingUser(null);
          setShowForm(true);
        }}
        onApproveUser={handleApproveUser} // Truyền prop duyệt user
      />

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          {" "}
          {/* Thêm p-4 để modal không chạm mép màn hình mobile */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md">
            {" "}
            {/* Tăng shadow, tối ưu w-full max-w-sm trên mobile */}
            <CreateUsers
              onSubmit={editingUser ? handleEditUser : handleCreateUser}
              initialData={editingUser}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default ManageUsersPage;
