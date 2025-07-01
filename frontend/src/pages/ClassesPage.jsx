import React, { useEffect, useState } from "react";
import CreateClass from "../components/classes/CreateClass";
import ClassesList from "../components/classes/ClassesList";
import ClassMembersModal from "../components/classes/ClassMembersModal";
import {
  createClass,
  deleteClass,
  getClass,
  joinClass,
  leaveClass,
  updateClass,
  viewClass,
  getClassMembers,
  removeMemberFromClass,
} from "../services/classesService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdateClass from "../components/classes/UpdateClass";

function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal thành viên
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [modalMembers, setModalMembers] = useState([]);
  const [modalClassName, setModalClassName] = useState("");
  const [modalClassId, setModalClassId] = useState("");

  const fetchClasses = async () => {
    try {
      const classesData = await getClass();
      setClasses(classesData);
    } catch (error) {
      toast.warning(error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // tạo lớp học mới
  const handleCreateClass = async (classData) => {
    try {
      const newClass = await createClass(classData);
      setClasses((prevClasses) => [newClass, ...prevClasses]);
      toast.success("Tạo lớp học thành công!");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warn("Tiêu đề đã tồn tại, vui lòng nhập tiêu đề khác.");
      } else {
        toast.error("Lỗi khi tạo lớp");
      }
      console.error(error);
    }
  };

  // cập nhật thông tin lớp học
  const handleUpdateClass = async (classId, updatedClass) => {
    try {
      const updated = await updateClass(classId, updatedClass);
      setClasses((prevClasses) =>
        prevClasses.map((classItem) =>
          classItem._id === classId ? { ...classItem, ...updated } : classItem
        )
      );
      toast.success("Cập nhật lớp học thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật lớp:", error);
      toast.error("Cập nhật lớp học thất bại!");
    }
  };

  //xóa lớp học
  const handleDeleteClass = async (classId) => {
    if (isTeacher) {
      toast.error(
        "Bạn không có quyền xóa lớp học này, chỉ admin mới được xóa!"
      );
      return;
    }
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa lớp học này?"
    );

    if (!confirmDelete) return;
    try {
      await deleteClass(classId);
      setClasses((prev) =>
        prev.filter((classItem) => classItem._id !== classId)
      );
      toast.success("Xóa lớp học thành công");
    } catch (error) {
      console.error("Lỗi khi xóa lớp học:", error);
      toast.error("Xóa lớp học thất bại!");
    }
  };

  // tham gia lớp học
  const handleJoinClass = async (classId) => {
    try {
      await joinClass(classId);
      toast.success("Tham gia lớp học thành công");
      fetchClasses();
    } catch (error) {
      console.error("Lỗi khi tham gia lớp:", error);
      toast.error(
        "Không thể tham gia lớp học hoặc bạn không nằm trong danh sách lớp này!"
      );
    }
  };

  // xem chi tiết lớp học
  const handleViewClass = async (classId) => {
    // Lấy thông tin lớp để lấy tên lớp
    const classDetails = classes.find((c) => c._id === classId);
    setModalClassName(classDetails?.nameClass || "");
    setModalClassId(classId);
    setShowMembersModal(true);
    try {
      // Gọi API lấy danh sách thành viên
      const members = await getClassMembers(classId);
      setModalMembers(members);
    } catch (error) {
      setModalMembers([]);
      toast.error("Không thể lấy danh sách thành viên lớp này!");
    }
  };

  // Xóa thành viên khỏi lớp (chỉ admin)
  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người này khỏi lớp?"))
      return;
    try {
      await removeMemberFromClass(modalClassId, userId);
      setModalMembers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("Đã xóa thành viên khỏi lớp!");
    } catch (e) {
      toast.error("Xóa thành viên thất bại!");
    }
  };
  // rời lớp học
  const handleLeaveClass = async (classId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn rời lớp học này?"
    );

    if (!confirmDelete) return;
    try {
      await leaveClass(classId);
      toast.success("Rời khỏi lớp học thành công!");
      fetchClasses();
    } catch (error) {
      console.error("Lỗi khi rời lớp học:", error);
      toast.error("Lỗi khi rời lớp học!");
    }
  };

  const handleOpenEditModal = (classId) => {
    const classToEdit = classes.find((classItem) => classItem._id === classId);
    setSelectedClass(classToEdit);
    setShowEditModal(true);
  };

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isMember = role === "user";

  const isMemberOrTeacher = isMember || isTeacher;
  const isAdminOrTeacher = isAdmin || isTeacher;
  const userId = localStorage.getItem("userId");

  const getUserJoinedClasses = (userId, classes) => {
    if (!userId || !classes) return [];
    return classes.filter((classItem) => classItem.members?.includes(userId));
  };

  const userClasses = getUserJoinedClasses(userId, classes);

  // CHỨC NĂNG TÌM KIẾM
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.nameClass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <main className="flex-grow container mx-auto px-20 py-6 mt-14">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-center md:text-left text-gray-800 dark:text-gray-200">
            {isAdmin ? "Quản lý lớp học" : " Lớp của tôi"}
          </h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <input
              id="classSearch"
              type="text"
              placeholder="Tìm kiếm lớp học"
              className="w-full md:w-auto px-3 py-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* <button
              id="searchBtn"
              className="bg-blue-500 text-white px-4 py-2 rounded w-full md:w-auto"
              type="button"
            >
              <i className="fas fa-search"></i>
            </button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* nếu là giáo viên và admin sẽ hiển thị from tạo lớp học */}
          {isAdmin && <CreateClass onCreate={handleCreateClass} />}

          {/* nếu là user sẽ hiển thị from tạo lớp học */}
          {isMemberOrTeacher && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4">Lớp học của tôi</h3>
              <ul id="userClassesList" className="divide-y">
                {userClasses.length > 0 ? (
                  userClasses.map((classItem) => (
                    <li key={classItem._id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {classItem.nameClass}
                          </div>
                          <div className="text-xs text-gray-500">
                            <i className="fas fa-users mr-2"></i>
                            <span>
                              {classItem.members?.length || 0} thành viên
                            </span>
                          </div>
                        </div>
                        {/* nút xem */}
                        {/* <button
                          onClick={() => handleViewClass(classItem._id)}
                          className="text-blue-500 hover:underline"
                        >
                          <i className="fas fa-eye"></i>
                        </button> */}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-center text-gray-500">
                    <i className="fas fa-info-circle mr-2"></i> Bạn chưa tham
                    gia lớp nào.
                  </li>
                )}
              </ul>
            </div>
          )}

          <ClassesList
            classes={filteredClasses}
            onDelete={handleDeleteClass}
            onJoin={handleJoinClass}
            onLeave={handleLeaveClass}
            onView={handleViewClass}
            onUpdate={handleOpenEditModal}
          />

          <UpdateClass
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleUpdateClass}
            classData={selectedClass}
          />
        </div>
      </main>
      <ClassMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={modalMembers}
        classesName={modalClassName}
        onRemoveMember={handleRemoveMember}
        isAdmin={isAdmin}
      />
      <ToastContainer />
    </>
  );
}

export default ClassesPage;
