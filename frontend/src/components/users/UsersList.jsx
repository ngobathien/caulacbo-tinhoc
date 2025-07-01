import React, { useState, useEffect, useRef } from "react";
import Pagination from "../../components/layouts/Pagination";
const PAGE_SIZE = 5;

function UsersList({
  users,
  onEditUser,
  onDeleteUser,
  onShowCreateUser,
  onApproveUser,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Lưu trang hiện tại trước khi danh sách users thay đổi
  const prevUsersLength = useRef(users.length);

  // Tính tổng số trang
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  // Xử lý giữ nguyên trang hiện tại khi users thay đổi
  useEffect(() => {
    // Nếu số lượng user giảm (vd: xóa user), kiểm tra nếu currentPage > totalPages mới thì set về trang cuối cùng
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
    prevUsersLength.current = users.length;
    // eslint-disable-next-line
  }, [users, totalPages]);

  const paginatedData = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
            Quản lý người dùng
          </h1>
        </div>
        {paginatedData.length === 0 ? (
          <p className="text-gray-500 text-center">Không có người dùng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              {/* ... bảng như cũ ... */}
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold ">
                    STT
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold">
                    ID
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold">
                    Họ và tên
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold">
                    Email
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold">
                    Vai Trò
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold">
                    Trạng thái duyệt
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((user, index) => (
                  <tr
                    key={user._id || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      {user._id}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      {user.username}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      {user.email}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      <select
                        className="border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={user.role}
                        onChange={(e) =>
                          onEditUser({ ...user, role: e.target.value })
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      {user.isApproved ? (
                        <span className="text-green-600 font-semibold">
                          Đã duyệt
                        </span>
                      ) : (
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md  transition-colors"
                          onClick={() => onApproveUser(user._id)}
                        >
                          Duyệt
                        </button>
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                          onClick={() => onEditUser(user)}
                        >
                          Sửa
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                          onClick={() => onDeleteUser(user._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default UsersList;
