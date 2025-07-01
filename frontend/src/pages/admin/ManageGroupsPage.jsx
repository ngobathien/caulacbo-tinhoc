import React, { useEffect, useState } from "react";
import {
  createClass,
  deleteClass,
  getClass,
  updateClass,
} from "../../services/classesService";

function ManageClassesPage() {
  const [classes, setClasses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [editClassId, setEditClassId] = useState(null);

  const fetchClass = async () => {
    const classData = await getClass();
    setClasses(classData);
  };

  useEffect(() => {
    fetchClass();
  }, []);

  const handleInputChange = (e) => {
    setNewClass({ ...newClass, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (editMode) {
      await updateClass(editClassId, newClass);
    } else {
      await createClass(newClass);
    }
    setShowCreateModal(false);
    setNewClass({ name: "", description: "" });
    setEditMode(false);
    fetchClass();
  };

  const onEdit = (classItem) => {
    setEditMode(true);
    setNewClass({ name: classItem.name, description: classItem.description });
    setEditClassId(classItem._id);
    setShowCreateModal(true);
  };

  const onDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa lớp học này không?")) {
      await deleteClass(id);
      fetchClass();
    }
  };

  const renderAdminTable = () => (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Quản lý lớp học</h1>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setEditMode(false);
            setNewClass({ name: "", description: "" });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Thêm lớp học
        </button>
      </div>

      {classes.length === 0 ? (
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
                <th className="border px-4 py-3 text-sm text-center">Mô tả</th>
                <th className="border px-4 py-3 text-sm text-center">
                  Số lượng
                </th>
                <th className="border px-4 py-3 text-sm text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem, index) => (
                <tr key={classItem._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-3 text-sm text-center">
                    {index + 1}
                  </td>
                  <td className="border px-4 py-3 text-sm text-center">
                    {classItem._id}
                  </td>
                  <td className="border px-4 py-3 text-sm text-center">
                    {classItem.name}
                  </td>
                  <td className="border px-4 py-3 text-sm ">
                    {classItem.description}
                  </td>
                  <td className="border px-4 py-3 text-sm text-center">
                    {classItem.member?.length || 0}
                  </td>
                  <td className="border px-4 py-3 text-sm text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(classItem)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(classItem._id)}
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
  );

  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-lg font-semibold mb-4">
          {editMode ? "Chỉnh sửa lớp học" : "Thêm lớp học"}
        </h2>
        <input
          type="text"
          name="name"
          value={newClass.name}
          onChange={handleInputChange}
          placeholder="Tên lớp"
          className="w-full mb-3 px-3 py-2 border rounded"
        />
        <textarea
          name="description"
          value={newClass.description}
          onChange={handleInputChange}
          placeholder="Mô tả"
          className="w-full mb-3 px-3 py-2 border rounded"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowCreateModal(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editMode ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderAdminTable()}
      {showCreateModal && renderModal()}
    </>
  );
}

export default ManageClassesPage;
