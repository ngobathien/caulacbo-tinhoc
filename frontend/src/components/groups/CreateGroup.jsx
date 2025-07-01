import React, { useState, useEffect } from "react";
import { getClass } from "../../services/classesService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreateGroup({ onCreate, onFilter }) {
  const [classes, setClasses] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [filterClassId, setFilterClassId] = useState("");

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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!classId || !groupName) {
      toast.error("Vui lòng chọn lớp học và nhập tên nhóm!");
      return;
    }
    const newGroup = {
      nameGroup: groupName,
      description,
      classId,
    };
    onCreate(newGroup);
    setGroupName("");
    setDescription("");
    setClassId("");
    toast.success("Tạo nhóm thành công!");
  };

  const handleKeyDown = (e) => {
    if (
      (e.target.id === "groupName" && e.key === "Enter") ||
      (e.target.id === "groupDescription" && e.key === "Enter" && !e.shiftKey)
    ) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Lọc theo lớp học
  const handleFilterChange = (e) => {
    const selectedClassId = e.target.value;
    setFilterClassId(selectedClassId);
    if (onFilter) onFilter(selectedClassId); // gọi lên cha
  };

  return (
    <div className="lg:col-span-1">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white text-gray-800 dark:text-gray-200">
          Thêm nhóm mới
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
              Lớp học
            </label>
            <select
              id="classId"
              className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.nameClass}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
              Tên nhóm
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tên nhóm"
              className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
              Mô tả (không bắt buộc)
            </label>
            <textarea
              id="groupDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mô tả nhóm"
              className="w-full px-3 py-2 border rounded h-24 dark:bg-gray-900 dark:text-white dark:border-gray-700"
            ></textarea>
            <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">
              Nhấn <b>Enter</b> để lưu, <b>Shift+Enter</b> để xuống dòng
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            <i className="fas fa-plus mr-2"></i>Thêm nhóm
          </button>
        </div>
      </div>

      {/* <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Lọc theo lớp học
        </h3>
        <select
          id="classFilter"
          value={filterClassId}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
        >
          <option value="">Tất cả lớp học</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.nameClass}
            </option>
          ))}
        </select>
      </div> */}
    </div>
  );
}

export default CreateGroup;
