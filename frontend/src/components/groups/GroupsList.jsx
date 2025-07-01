import React, { useState, useEffect } from "react";
import { getClass } from "../../services/classesService";
import Pagination from "../layouts/Pagination";
const PAGE_SIZE = 6;

function GroupsList({
  groups,
  onJoinGroup,
  onLeaveGroup,
  onDeleteGroup,
  onViewGroup,
  onUpdateGroup,
}) {
  const [classes, setClasses] = useState([]);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isMember = role === "user";
  const userId = localStorage.getItem("userId");

  // phân trang dữ liệu
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(groups.length / PAGE_SIZE);
  const paginatedData = groups.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // lấy dữ liệu từ classes để set lựa chọn lớp
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClass();
        setClasses(data);
      } catch (error) {
        console.error("Lỗi khi tải lớp học", error);
      }
    };
    fetchClasses();
  }, []);

  return (
    <>
      <div className="lg:col-span-3">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedData && paginatedData.length > 0 ? (
            paginatedData.map((group) => {
              const isJoined = group.members?.some(
                (member) => member._id?.toString() === userId
              );

              // ADMIN
              if (isAdmin) {
                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="bg-green-500 text-white p-4">
                      <h3 className="text-xl font-bold">{group.nameGroup}</h3>
                    </div>
                    <div className="p-4">
                      {/* nhãn lớp học */}
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <i className="fas fa-graduation-cap mr-1"></i>
                        {group.classId?.nameClass || "Không rõ lớp"}
                      </span>
                      <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                        {group.description || "Không có mô tả"}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <i className="fas fa-users mr-2"></i>
                        <span>{group.members?.length || 0} thành viên</span>
                      </div>
                      <div className="flex justify-between">
                        {/* Xem nhóm */}
                        <button
                          onClick={() => onViewGroup(group._id)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          <i className="fas fa-eye mr-1"></i>Xem
                        </button>
                        {/* Sửa + Xóa */}
                        <div>
                          <button
                            onClick={() => onUpdateGroup(group._id)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 mr-2"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => onDeleteGroup(group._id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              console.log("classId của nhóm:", group.classId);
              // TEACHER
              if (isTeacher) {
                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="bg-green-500 text-white p-4">
                      <h3 className="text-xl font-bold">{group.nameGroup}</h3>
                    </div>
                    <div className="p-4">
                      {/* nhãn lớp học */}
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <i className="fas fa-graduation-cap mr-1"></i>
                        {group.classId?.nameClass || "Không rõ lớp"}
                      </span>
                      <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                        {group.description || "Không có mô tả"}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <i className="fas fa-users mr-2"></i>
                        <span>{group.members?.length || 0} thành viên</span>
                      </div>
                      {/* Nếu chưa vào nhóm: chỉ hiện Tham gia */}
                      {!isJoined && (
                        <button
                          onClick={() => onJoinGroup(group._id)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          <i className="fas fa-sign-in-alt mr-1"></i>Tham gia
                        </button>
                      )}
                      {/* Nếu đã vào nhóm: hiện Xem + Sửa + Rời + Xóa */}
                      {isJoined && (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => onViewGroup(group._id)}
                            className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                          >
                            <i className="fas fa-eye mr-1"></i>Xem
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onUpdateGroup(group._id)}
                              className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => onLeaveGroup(group._id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <i className="fas fa-sign-out-alt mr-1"></i>Rời
                              khỏi
                            </button>
                            {/* <button
                              onClick={() => onDeleteGroup(group._id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <i className="fas fa-trash"></i>
                            </button> */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // USER
              if (isMember) {
                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="bg-green-500 text-white p-4">
                      <h3 className="text-xl font-bold">{group.nameGroup}</h3>
                    </div>
                    <div className="p-4">
                      {/* nhãn lớp học */}
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <i className="fas fa-graduation-cap mr-1"></i>
                        {group.classId?.nameClass || "Không rõ lớp"}
                      </span>
                      <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                        {group.description || "Không có mô tả"}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <i className="fas fa-users mr-2"></i>
                        <span>{group.members?.length || 0} thành viên</span>
                      </div>
                      {/* Nếu chưa vào nhóm: chỉ hiện Tham gia */}
                      {!isJoined && (
                        <button
                          onClick={() => onJoinGroup(group._id)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          <i className="fas fa-sign-in-alt mr-1"></i>Tham gia
                        </button>
                      )}
                      {/* Nếu đã vào nhóm: chỉ hiện Rời */}
                      {isJoined && (
                        <button
                          onClick={() => onLeaveGroup(group._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          <i className="fas fa-sign-out-alt mr-1"></i>Rời khỏi
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // Nếu không xác định được quyền
              return null;
            })
          ) : (
            <div className="lg:col-span-3">
              <div id="assignmentList" className="grid grid-cols-1 gap-4">
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <i className="fas fa-spinner fa-pulse text-3xl mb-2"></i>
                    <p>Bạn chưa tham gia lớp nào để hiển thị nhóm...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage} // setCurrentPage là hàm trả về từ useState!
        />
      </div>
    </>
  );
}

export default GroupsList;
