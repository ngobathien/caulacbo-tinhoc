import React, { useState, useEffect } from "react";
import AssignmentSubmissionsList from "./AssignmentSubmissionsList";
import SubmitAssignment from "./SubmitAssignment";

const PAGE_SIZE = 3;

function AssignmentList({
  assignments = [],
  loading,
  isAdminOrTeacher,
  isAdmin,
  isTeacher,
  isMember,
  isMemberOrTeacher,
  onDelete,
  onEdit,
  searchTerm,
  selectedClass,
  selectedGroup,
  joinedClassIds = [],
  joinedGroupIds = [],
}) {
  // Lọc assignment theo filter lớp/nhóm và theo quyền user đã join
  let visibleAssignments = assignments;

  // Chỉ hiển thị những assignment thuộc lớp đã join (nếu là user/thầy)
  if ((isMember || isTeacher) && joinedClassIds.length > 0) {
    visibleAssignments = visibleAssignments.filter(
      (a) =>
        a.classId &&
        joinedClassIds.includes(
          typeof a.classId === "object" ? a.classId._id : a.classId
        )
    );
  }

  // Lọc theo lớp học (nếu đã chọn)
  if (selectedClass) {
    visibleAssignments = visibleAssignments.filter(
      (a) =>
        a.classId &&
        ((typeof a.classId === "object" && a.classId._id === selectedClass) ||
          a.classId === selectedClass)
    );
  }

  // Chỉ hiển thị assignment thuộc nhóm đã join (nếu là user/thầy)
  // if ((isMember || isTeacher) && joinedGroupIds.length > 0) {
  //   visibleAssignments = visibleAssignments.filter(
  //     (a) =>
  //       a.groupId &&
  //       joinedGroupIds.includes(
  //         typeof a.groupId === "object" ? a.groupId._id : a.groupId
  //       )
  //   );
  // }

  // Lọc theo nhóm (nếu đã chọn)
  if (selectedGroup) {
    visibleAssignments = visibleAssignments.filter(
      (a) =>
        a.groupId &&
        ((typeof a.groupId === "object" && a.groupId._id === selectedGroup) ||
          a.groupId === selectedGroup)
    );
  }

  // Lọc theo search term
  if (searchTerm && searchTerm.trim() !== "") {
    visibleAssignments = visibleAssignments.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.description &&
          a.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Sắp xếp bài tập mới lên trên
  visibleAssignments = [...visibleAssignments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(visibleAssignments.length / PAGE_SIZE);
  const paginatedAssignments = visibleAssignments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedClass,
    selectedGroup,
    searchTerm,
    assignments.length,
    joinedClassIds.length,
    joinedGroupIds.length,
  ]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      end = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center mt-6 gap-1 flex-wrap">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500"
              : "bg-white hover:bg-blue-50"
          }`}
        >
          &lt;
        </button>
        {start > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 rounded border bg-white hover:bg-blue-50"
            >
              1
            </button>
            {start > 2 && <span className="px-1">...</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`px-3 py-1 rounded border ${
              p === currentPage
                ? "bg-blue-500 text-white font-bold"
                : "bg-white hover:bg-blue-50"
            }`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 rounded border bg-white hover:bg-blue-50"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500"
              : "bg-white hover:bg-blue-50"
          }`}
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {loading ? (
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <i className="fas fa-spinner fa-pulse text-3xl mb-2"></i>
            <p>Đang tải bài tập...</p>
          </div>
        </div>
      ) : paginatedAssignments.length > 0 ? (
        <>
          {paginatedAssignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="border-b pb-3 mb-3">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {assignment.title}
                </h3>
                {/* ngày tạo */}
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  Ngày tạo:{" "}
                  {assignment.createdAt
                    ? new Date(assignment.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Không rõ"}
                </span>
                <div className="flex items-center justify-between text-sm mt-1 flex-wrap gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      <i className="fas fa-graduation-cap mr-1"></i>
                      {assignment.classId?.nameClass || "Không có lớp"}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      <i className="fas fa-users mr-1"></i>
                      {assignment.groupId?.nameGroup || "Mọi nhóm"}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-right">
                    <span className="text-red-600 text-sm">
                      {assignment.dueDate
                        ? `Hạn nộp: ${new Date(
                            assignment.dueDate
                          ).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Không có hạn nộp"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{assignment.description}</p>

              {isMember && (
                <SubmitAssignment
                  assignmentId={assignment._id}
                  nameClass={assignment.classId?.nameClass}
                  nameGroup={assignment.groupId?.nameGroup}
                  classId={
                    typeof assignment.classId === "object"
                      ? assignment.classId._id
                      : assignment.classId
                  }
                  groupId={
                    typeof assignment.groupId === "object"
                      ? assignment.groupId._id
                      : assignment.groupId
                  }
                  dueDate={assignment.dueDate}
                />
              )}

              {isTeacher && (
                <AssignmentSubmissionsList
                  assignmentId={assignment._id}
                  groupId={assignment.groupId}
                />
              )}

              {isAdmin && (
                <AssignmentSubmissionsList
                  assignmentId={assignment._id}
                  groupId={assignment.groupId}
                />
              )}

              {(isAdmin || isTeacher) && (
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                    onClick={() => onEdit(assignment)}
                  >
                    <i className="fas fa-edit mr-1"></i> Sửa
                  </button>
                  <button
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    onClick={() => onDelete(assignment._id)}
                  >
                    <i className="fas fa-trash mr-1"></i> Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
          {renderPagination()}
        </>
      ) : (
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <i className="fas fa-spinner fa-pulse text-3xl mb-2"></i>
            <p>Không có bài tập nào...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentList;
