import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createAssignment,
  updateAssignment,
} from "../../services/assignmentService";
import { getClass, getUserClasses } from "../../services/classesService";
import {
  getGroupsOfClass,
  getGroupsUserJoined,
} from "../../services/groupService";

function AssignmentForm({
  onSuccess,
  editingAssignment,
  onCancelEdit,
  onUpdate,
}) {
  const isEditing = !!editingAssignment;

  const [form, setForm] = useState({
    classId: "",
    groupId: "",
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
  });
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (isEditing && editingAssignment) {
      let dueDate = "";
      let dueTime = "";
      if (editingAssignment.dueDate) {
        const dt = new Date(editingAssignment.dueDate);
        if (!isNaN(dt.getTime())) {
          dueDate = dt.toISOString().slice(0, 10);
          dueTime = dt.toTimeString().slice(0, 5);
        } else if (
          typeof editingAssignment.dueDate === "string" &&
          editingAssignment.dueDate.length >= 16
        ) {
          dueDate = editingAssignment.dueDate.slice(0, 10);
          dueTime = editingAssignment.dueDate.slice(11, 16);
        }
      }
      setForm({
        classId:
          editingAssignment.classId?._id || editingAssignment.classId || "",
        groupId:
          editingAssignment.groupId?._id || editingAssignment.groupId || "",
        title: editingAssignment.title || "",
        description: editingAssignment.description || "",
        dueDate,
        dueTime,
      });
    } else {
      setForm({
        classId: "",
        groupId: "",
        title: "",
        description: "",
        dueDate: "",
        dueTime: "",
      });
    }
  }, [editingAssignment, isEditing]);

  useEffect(() => {
    setLoadingClasses(true);
    if (isAdmin) {
      getClass()
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch(() => setClasses([]))
        .finally(() => setLoadingClasses(false));
    } else if (isTeacher) {
      getUserClasses(userId)
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch(() => setClasses([]))
        .finally(() => setLoadingClasses(false));
    }
  }, [isAdmin, isTeacher, userId]);

  useEffect(() => {
    setGroups([]);
    if (!form.classId) return;
    setLoadingGroups(true);

    if (isAdmin) {
      getGroupsOfClass(form.classId)
        .then((data) => setGroups(Array.isArray(data) ? data : []))
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    } else if (isTeacher) {
      getGroupsUserJoined()
        .then((allGroups) => {
          const filtered = (allGroups || []).filter(
            (g) =>
              g.classId &&
              (g.classId._id === form.classId ||
                g.classId === form.classId ||
                String(g.classId._id) === String(form.classId) ||
                String(g.classId) === String(form.classId))
          );
          setGroups(filtered);
        })
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    }
  }, [form.classId, isAdmin, isTeacher]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
      ...(e.target.name === "classId" ? { groupId: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Chỉ bắt buộc classId và title, groupId không bắt buộc
    if (!form.classId || !form.title) {
      toast.warning("Vui lòng nhập đầy đủ thông tin bắt buộc (lớp, tiêu đề)!");
      return;
    }

    let fullDueDate = form.dueDate;
    if (form.dueDate && form.dueTime) {
      fullDueDate = `${form.dueDate}T${form.dueTime}`;
    } else if (form.dueDate) {
      fullDueDate = form.dueDate;
    } else {
      fullDueDate = "";
    }

    // Nếu không chọn nhóm thì xóa groupId khỏi submitData
    const submitData = {
      ...form,
      dueDate: fullDueDate,
    };
    if (!submitData.groupId) {
      delete submitData.groupId;
    }

    try {
      if (isEditing && editingAssignment) {
        await updateAssignment(editingAssignment._id, submitData);
        toast.success("Cập nhật bài tập thành công!");
        onUpdate && onUpdate();
        onCancelEdit && onCancelEdit();
      } else {
        await createAssignment(submitData);
        toast.success("Đã thêm bài tập!");
        setForm({
          classId: "",
          groupId: "",
          title: "",
          description: "",
          dueDate: "",
          dueTime: "",
        });
        setGroups([]);
        onSuccess && onSuccess();
      }
    } catch {
      toast.error(
        isEditing ? "Không thể cập nhật bài tập!" : "Không thể thêm bài tập!"
      );
    }
  };

  if (!isAdmin && !isTeacher) return null;

  return (
    <div className="lg:col-span-1">
      <form
        className="bg-white p-6 rounded-lg shadow-md mb-6"
        onSubmit={handleSubmit}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {isEditing ? "Sửa bài tập" : "Thêm bài tập mới"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Lớp học <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border rounded focus:outline-none"
              name="classId"
              value={form.classId}
              onChange={handleChange}
              required
              disabled={loadingClasses}
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.nameClass}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Nhóm (không bắt buộc)
            </label>
            <select
              className="w-full px-3 py-2 border rounded focus:outline-none"
              name="groupId"
              value={form.groupId}
              onChange={handleChange}
              disabled={!form.classId || loadingGroups}
            >
              <option value="">-- Giao cho toàn bộ lớp --</option>
              {groups.map((g) => (
                <option value={g._id} key={g._id}>
                  {g.nameGroup}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              placeholder="Tiêu đề bài tập"
              className="w-full px-3 py-2 border rounded focus:outline-none"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              placeholder="Mô tả bài tập"
              className="w-full px-3 py-2 border rounded h-24 focus:outline-none"
              value={form.description}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Hạn nộp (ngày)
              </label>
              <input
                name="dueDate"
                type="date"
                className="w-full px-3 py-2 border rounded focus:outline-none"
                value={form.dueDate}
                onChange={handleChange}
              />
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Giờ nộp (không bắt buộc)
              </label>
              <input
                name="dueTime"
                type="time"
                className="w-full px-3 py-2 border rounded focus:outline-none"
                value={form.dueTime}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              <i
                className={`fas ${isEditing ? "fa-save" : "fa-plus"} mr-2`}
              ></i>
              {isEditing ? "Lưu thay đổi" : "Thêm bài tập"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="w-full bg-gray-300 text-gray-700 dark:text-white py-2 rounded hover:bg-gray-400 transition"
                onClick={onCancelEdit}
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default AssignmentForm;
