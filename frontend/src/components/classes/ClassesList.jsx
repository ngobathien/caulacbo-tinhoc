import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadAllowedEmailsCsv from "./UploadAllowedEmailsCsv";
import Pagination from "../layouts/Pagination";
const PAGE_SIZE = 6;

function ClassesList({ classes, onUpdate, onDelete, onJoin, onLeave, onView }) {
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isMember = role === "user";
  const userId = localStorage.getItem("userId");

  // phân trang dữ liệu
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(classes.length / PAGE_SIZE);
  const paginatedData = classes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="lg:col-span-3">
      <div
        id="classes"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {paginatedData && paginatedData.length > 0 ? (
          paginatedData.map((classItem) => {
            const isJoined = classItem.members?.includes(userId);
            const hasUploaded =
              Array.isArray(classItem.allowedEmails) &&
              classItem.allowedEmails.length > 0;

            // ADMIN: Có upload CSV + CRUD
            if (isAdmin) {
              return (
                <div
                  key={classItem._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-blue-500 text-white p-4">
                    <h3 className="text-xl font-bold">{classItem.nameClass}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                      {classItem.description || "Không có mô tả"}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <i className="fas fa-users mr-2"></i>
                      <span>{classItem.members?.length || 0} thành viên</span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-2 items-center">
                      <UploadAllowedEmailsCsv
                        classId={classItem._id}
                        initialUploaded={hasUploaded}
                        onSuccess={() => {}}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdate(classItem._id)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => onDelete(classItem._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <button
                          onClick={() => onView(classItem._id)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        >
                          <i className="fas fa-eye mr-1"></i>Xem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // GIÁO VIÊN
            if (isTeacher) {
              return (
                <div
                  key={classItem._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-blue-500 text-white p-4">
                    <h3 className="text-xl font-bold">{classItem.nameClass}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                      {classItem.description || "Không có mô tả"}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <i className="fas fa-users mr-2"></i>
                      <span>{classItem.members?.length || 0} thành viên</span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-2">
                      {!isJoined && (
                        <button
                          onClick={() => onJoin(classItem._id)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          <i className="fas fa-sign-in-alt mr-1"></i>Tham gia
                        </button>
                      )}
                      {isJoined && (
                        <div className="flex justify-between flex-wrap gap-2">
                          <button
                            onClick={() => onView(classItem._id)}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          >
                            <i className="fas fa-eye mr-1"></i>Xem
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onUpdate(classItem._id)}
                              className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => onLeave(classItem._id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <i className="fas fa-sign-out-alt mr-1"></i>Rời
                              khỏi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // USER
            if (isMember) {
              return (
                <div
                  key={classItem._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-blue-500 text-white p-4">
                    <h3 className="text-xl font-bold">{classItem.nameClass}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 mb-4 h-12 overflow-hidden">
                      {classItem.description || "Không có mô tả"}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <i className="fas fa-users mr-2"></i>
                      <span>{classItem.members?.length || 0} thành viên</span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-2">
                      {!isJoined && (
                        <button
                          onClick={() => onJoin(classItem._id)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          <i className="fas fa-sign-in-alt mr-1"></i>Tham gia
                        </button>
                      )}
                      {isJoined && (
                        <button
                          onClick={() => onLeave(classItem._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          <i className="fas fa-sign-out-alt mr-1"></i>Rời khỏi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })
        ) : (
          <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <i className="fas fa-spinner fa-pulse text-3xl mb-2"></i>
              <p>Đang tải dữ liệu...</p>
            </div>
          </div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage} // setCurrentPage là hàm trả về từ useState!
      />
      <ToastContainer />
    </div>
  );
}

export default ClassesList;
