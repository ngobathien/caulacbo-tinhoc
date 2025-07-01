import React, { useEffect, useState } from "react";
import {
  createClass,
  deleteClass,
  getClass,
  updateClass,
} from "../../services/classesService";
import Pagination from "../../components/layouts/Pagination";
import { toast, ToastContainer } from "react-toastify";
import ClassFormModal from "../../components/classes/ClassFormModal";

const PAGE_SIZE = 5;

function ManageClassesPage() {
  const [classes, setClasses] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentFormMode, setCurrentFormMode] = useState("create");
  const [editingClassData, setEditingClassData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(classes.length / PAGE_SIZE);
  const paginatedData = classes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const fetchClasses = async () => {
    try {
      const classData = await getClass();
      setClasses(classData);
    } catch (error) {
      toast.error("Lỗi khi tải lớp học!");
      console.error("Lỗi khi tải lớp học:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // --- HÀM XỬ LÝ KHI TẠO LỚP HỌC ---
  const handleCreateSubmit = async (formData) => {
    try {
      // Gọi API để tạo lớp và nhận lại dữ liệu lớp mới từ server
      const newClassFromServer = await createClass(formData);

      // CẬP NHẬT STATE TRỰC TIẾP: Thêm lớp mới vào ĐẦU danh sách
      setClasses((prevClasses) => [newClassFromServer, ...prevClasses]);

      toast.success("Thêm lớp học thành công!");
      setCurrentPage(1); // Quay về trang đầu tiên để người dùng thấy lớp mới
      setShowFormModal(false); // Đóng modal sau khi thành công

      // KHÔNG CẦN GỌI fetchClasses() Ở ĐÂY NỮA
      // Vì state đã được cập nhật trực tiếp, việc gọi lại API là không cần thiết
      // và có thể gây chậm trễ không cần thiết.
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.warning("Tên lớp học đã tồn tại. Vui lòng chọn tên khác.");
      } else {
        toast.error("Lỗi khi thêm lớp học!");
        console.error("Lỗi khi thêm lớp học:", error);
      }
    }
  };

  // --- HÀM XỬ LÝ KHI CẬP NHẬT LỚP HỌC ---
  const handleUpdateSubmit = async (formData) => {
    if (!editingClassData?._id) {
      toast.error("Không tìm thấy ID lớp học để cập nhật.");
      return;
    }
    try {
      // Gọi API để cập nhật lớp và nhận lại dữ liệu lớp đã cập nhật từ server
      const updatedClassFromServer = await updateClass(
        editingClassData._id,
        formData
      );

      // CẬP NHẬT STATE TRỰC TIẾP: Tìm và thay thế lớp đã cập nhật
      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls._id === editingClassData._id ? updatedClassFromServer : cls
        )
      );

      toast.success("Cập nhật lớp học thành công!");
      setShowFormModal(false);
      setEditingClassData(null);

      // KHÔNG CẦN GỌI fetchClasses() Ở ĐÂY NỮA
      // Vì state đã được cập nhật trực tiếp.
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.warning("Tên lớp học đã tồn tại. Vui lòng chọn tên khác.");
      } else {
        toast.error("Lỗi khi cập nhật lớp học!");
        console.error("Lỗi khi cập nhật lớp học:", error);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setCurrentFormMode("create");
    setEditingClassData(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (classItem) => {
    setCurrentFormMode("edit");
    setEditingClassData(classItem);
    setShowFormModal(true);
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa lớp học này không?")) {
      try {
        await deleteClass(id);
        toast.success("Xóa lớp học thành công!");

        // CẬP NHẬT STATE TRỰC TIẾP: Lọc bỏ lớp đã xóa
        setClasses((prevClasses) =>
          prevClasses.filter((cls) => cls._id !== id)
        );

        // KHÔNG CẦN GỌI fetchClasses() Ở ĐÂY NỮA
        // Vì state đã được cập nhật trực tiếp.

        if (paginatedData.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } catch (error) {
        toast.error("Lỗi khi xóa lớp học!");
        console.error("Lỗi khi xóa lớp học:", error);
      }
    }
  };

  return (
    <>
      <main className="flex-grow container mx-auto px-36 py-6 mt-14">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Quản lý lớp học
            </h1>
            <button
              onClick={handleOpenCreateModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Thêm lớp học
            </button>
          </div>

          {paginatedData.length === 0 ? (
            <p className="text-gray-500 text-center">Chưa có lớp học nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border px-4 py-3 text-sm">STT</th>
                    <th className="border px-4 py-3 text-sm text-center">ID</th>
                    <th className="border px-4 py-3 text-sm text-center">
                      Tên lớp
                    </th>
                    <th className="border px-4 py-3 text-sm text-center">
                      Số lượng thành viên
                    </th>
                    <th className="border px-4 py-3 text-sm text-center">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((classItem, index) => (
                    <tr
                      key={classItem._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="border px-4 py-3 text-sm text-center">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="border px-4 py-3 text-sm text-center">
                        {classItem._id}
                      </td>
                      <td className="border px-4 py-3 text-sm text-center">
                        {classItem.nameClass || classItem.name}
                      </td>
                      <td className="border px-4 py-3 text-sm text-center">
                        {classItem.members?.length || 0}
                      </td>
                      <td className="border px-4 py-3 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(classItem)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteClass(classItem._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
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
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      <ClassFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={
          currentFormMode === "create" ? handleCreateSubmit : handleUpdateSubmit
        }
        mode={currentFormMode}
        initialData={editingClassData}
      />

      <ToastContainer />
    </>
  );
}

export default ManageClassesPage;
