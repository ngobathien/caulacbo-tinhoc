import React, { useEffect, useState } from "react";
import {
  getAssignments,
  deleteAssignment,
} from "../services/assignmentService";
import { getClass } from "../services/classesService";
import {
  getGroupsOfClass,
  getGroupsUserJoined,
} from "../services/groupService";
import { toast, ToastContainer } from "react-toastify";
import AssignmentForm from "../components/assignments/AssignmentForm";
import AssignmentList from "../components/assignments/AssignmentList";

function AssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allJoinedGroups, setAllJoinedGroups] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isMember = role === "user";
  const isMemberOrTeacher = isMember || isTeacher;
  const isAdminOrTeacher = isAdmin || isTeacher;

  // Lấy lớp và nhóm cho filter
  useEffect(() => {
    if (isAdmin) {
      getClass()
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch(() => setClasses([]));
    } else if (isTeacher || isMember) {
      getGroupsUserJoined()
        .then((joinedGroups) => {
          const uniqueClassesMap = {};
          joinedGroups.forEach((g) => {
            let classObj;
            if (g.classId && typeof g.classId === "object") {
              classObj = {
                _id: g.classId._id,
                nameClass: g.classId.nameClass || "Chưa rõ tên",
              };
            } else if (g.classId) {
              classObj = {
                _id: g.classId,
                nameClass: g.className || "Chưa rõ tên",
              };
            }
            if (classObj && classObj._id) {
              uniqueClassesMap[classObj._id] = classObj;
            }
          });
          setClasses(Object.values(uniqueClassesMap));
          setAllJoinedGroups(joinedGroups);
        })
        .catch(() => {
          setClasses([]);
          setAllJoinedGroups([]);
        });
    }
  }, [isAdmin, isTeacher, isMember]);

  // Khi chọn filter class, lọc lại group đã join thuộc class đó (user/teacher)
  useEffect(() => {
    if (isAdmin) {
      if (selectedClass) {
        getGroupsOfClass(selectedClass)
          .then((data) => setGroups(Array.isArray(data) ? data : []))
          .catch(() => setGroups([]));
      } else {
        setGroups([]);
      }
      setSelectedGroup("");
    } else if (isTeacher || isMember) {
      let filtered = [];
      if (selectedClass) {
        filtered = allJoinedGroups.filter((g) => {
          if (!g.classId) return false;
          if (typeof g.classId === "object")
            return g.classId._id === selectedClass;
          return g.classId === selectedClass;
        });
      }
      setGroups(filtered);
      setSelectedGroup(""); // luôn reset khi đổi class
    }
  }, [selectedClass, isAdmin, isTeacher, isMember, allJoinedGroups]);

  // Lấy danh sách assignment phù hợp filter
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let data = [];
        if (isAdmin) {
          // Admin: có thể lọc theo classId/groupId
          const params = {};
          if (selectedClass) params.classId = selectedClass;
          if (selectedGroup) params.groupId = selectedGroup;
          data = await getAssignments(params);
        } else if (isTeacher || isMember) {
          // Nếu chọn lớp và nhóm: chỉ bài tập nhóm đó trong lớp đó
          if (selectedClass && selectedGroup) {
            data = await getAssignments({
              classId: selectedClass,
              groupId: selectedGroup,
            });
          }
          // Nếu chỉ chọn lớp: assignment giao cho lớp và assignment giao cho các nhóm user đã join trong lớp
          else if (selectedClass && !selectedGroup) {
            // 1. Assignment giao cho cả lớp (groupId === null/undefined)
            const classAssignments = await getAssignments({
              classId: selectedClass,
            });
            // 2. Assignment giao cho các nhóm user đã join trong lớp đó
            const groupIds = allJoinedGroups
              .filter((g) => {
                if (!g.classId) return false;
                if (typeof g.classId === "object")
                  return g.classId._id === selectedClass;
                return g.classId === selectedClass;
              })
              .map((g) => g._id);

            let groupAssignments = [];
            for (const groupId of groupIds) {
              const groupData = await getAssignments({
                classId: selectedClass,
                groupId: groupId,
              });
              if (Array.isArray(groupData)) {
                groupAssignments = groupAssignments.concat(groupData);
              }
            }
            // Gộp assignment, loại trùng
            const assignmentsMap = new Map();
            (Array.isArray(classAssignments) ? classAssignments : []).forEach(
              (item) => {
                assignmentsMap.set(item._id, item);
              }
            );
            groupAssignments.forEach((item) => {
              assignmentsMap.set(item._id, item);
            });
            data = Array.from(assignmentsMap.values());
          }
          // Nếu không chọn gì: assignment của các nhóm user đã join
          else {
            const joinedGroups = await getGroupsUserJoined();
            let allAssignments = [];
            for (const group of joinedGroups) {
              const groupAssignments = await getAssignments({
                groupId: group._id,
              });
              if (Array.isArray(groupAssignments)) {
                allAssignments = allAssignments.concat(groupAssignments);
              }
            }
            // Lọc unique
            const assignmentsMap = new Map();
            allAssignments.forEach((item) => {
              assignmentsMap.set(item._id, item);
            });
            data = Array.from(assignmentsMap.values());
          }
        }
        setAssignments(data);
      } catch {
        toast.error("Không thể tải bài tập!");
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line
  }, [
    refresh,
    isAdmin,
    isTeacher,
    isMember,
    selectedClass,
    selectedGroup,
    allJoinedGroups,
  ]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")) return;
    try {
      await deleteAssignment(id);
      setRefresh((r) => !r);
      toast.success("Đã xóa bài tập!");
    } catch {
      toast.error("Không thể xóa bài tập!");
    }
  };

  // --- UI ---
  return (
    <main className="container mx-auto px-4 md:px-10 py-6 mt-14">
      <div className="flex flex-col-reverse md:flex-row gap-6">
        {/* Danh sách bài tập */}
        <div className="w-full md:w-3/4 h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {isAdmin ? "Quản lý bài tập" : "Bài tập của tôi"}
            </h2>
            <div className="flex flex-wrap md:flex-nowrap md:items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Tìm kiếm bài tập"
                className="px-3 py-2 border rounded focus:outline-none min-w-[170px] md:min-w-[200px] flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-3 py-2 border rounded focus:outline-none min-w-[120px]"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {isTeacher || isMember ? (
                  <>
                    <option value="">Tất cả lớp học</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nameClass}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="">Tất cả lớp học</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nameClass}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <select
                className="px-3 py-2 border rounded focus:outline-none min-w-[120px]"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={!selectedClass}
              >
                {isTeacher || isMember ? (
                  !selectedClass ? (
                    <option value="">Bạn chưa chọn lớp</option>
                  ) : groups.length === 0 ? (
                    <option value="">
                      Bạn chưa tham gia nhóm nào trong lớp này
                    </option>
                  ) : (
                    <>
                      <option value="">Tất cả nhóm</option>
                      {groups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.nameGroup}
                        </option>
                      ))}
                    </>
                  )
                ) : !selectedClass ? (
                  <option value="">Bạn chưa chọn lớp</option>
                ) : groups.length === 0 ? (
                  <option value="">Không có nhóm nào trong lớp này</option>
                ) : (
                  <>
                    <option value="">Tất cả nhóm</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.nameGroup}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
          <AssignmentList
            assignments={assignments}
            loading={loading}
            isAdminOrTeacher={isAdminOrTeacher}
            isMember={isMember}
            isTeacher={isTeacher}
            isMemberOrTeacher={isMemberOrTeacher}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onEdit={(assignment) => setEditingAssignment(assignment)}
            searchTerm={searchTerm}
            selectedClass={selectedClass}
            selectedGroup={selectedGroup}
            joinedClassIds={classes.map((cls) => cls._id)}
            joinedGroupIds={groups.map((gr) => gr._id)}
          />
        </div>
        {/* Form tạo bài tập (chỉ hiện với giáo viên/admin, luôn nằm bên phải trên màn hình lớn) */}
        {isAdminOrTeacher && (
          <div className="w-full md:w-1/4 flex flex-col gap-6 md:mt-0 mb-6 md:mb-0">
            <AssignmentForm
              isAdminOrTeacher={isAdminOrTeacher}
              isMember={isMember}
              isMemberOrTeacher={isMemberOrTeacher}
              isAdmin={isAdmin}
              onSuccess={() => setRefresh((r) => !r)}
              editingAssignment={editingAssignment}
              onCancelEdit={() => setEditingAssignment(null)}
              onUpdate={() => {
                setEditingAssignment(null);
                setRefresh((r) => !r);
              }}
            />
          </div>
        )}
      </div>
      <ToastContainer />
    </main>
  );
}

export default AssignmentPage;
