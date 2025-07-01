// ...imports...
import React, { useEffect, useState } from "react";
import CreateGroup from "../components/groups/CreateGroup";
import UpdateGroup from "../components/groups/UpdateGroup";
import GroupsList from "../components/groups/GroupsList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getGroups,
  createGroup,
  deleteGroup,
  updateGroup,
  joinGroup,
  leaveGroup,
  getGroupsOfClass,
  removeMemberFromGroup,
  getGroupMembers,
} from "../services/groupService";
import { getClass } from "../services/classesService";
import GroupMembersModal from "../components/groups/GroupMembersModal";

function GroupPage() {
  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState(""); // State lọc lớp học

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const isMember = role === "user";
  const isMemberOrTeacher = isMember || isTeacher;
  const isAdminOrTeacher = isAdmin || isTeacher;
  const userId = localStorage.getItem("userId");

  // Modal thành viên
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [modalMembers, setModalMembers] = useState([]);
  const [modalGroupName, setModalGroupName] = useState("");
  const [modalGroupId, setModalGroupId] = useState("");

  // check xem ai đã vào lớp, tham gia lớp học đó
  const getUserJoinedClasses = (userId, classes) => {
    if (!userId || !classes) return [];
    return classes.filter((classItem) => classItem.members?.includes(userId));
  };
  //
  const userClasses = getUserJoinedClasses(userId, classes);

  // check xem ai đã vào nhóm, tham gia lớp học đó
  const getUserJoinedGroup = (userId, groups) => {
    if (!userId || !groups) return [];
    return groups.filter((group) =>
      group.members?.some(
        (member) => member === userId || member._id === userId
      )
    );
  };
  const userGroup = getUserJoinedGroup(userId, groups);

  // Lấy dữ liệu lớp để hiển thị vào thẻ lớp học đã tham gia
  const fetchClasses = async () => {
    try {
      const classesData = await getClass();
      setClasses(classesData);
    } catch (error) {
      toast.warning(error);
    }
  };

  // LẤY NHÓM: Tùy theo vai trò
  const fetchGroupsSmart = async () => {
    try {
      if (isAdmin) {
        // admin/teacher lấy toàn bộ group
        const groupsData = await getGroups();
        setGroups(groupsData);
      } else {
        // member chỉ lấy group của các lớp đã join
        if (!userClasses.length) {
          setGroups([]);
          return;
        }
        const groupsArr = await Promise.all(
          userClasses.map((classItem) => getGroupsOfClass(classItem._id))
        );
        setGroups(groupsArr.flat());
      }
    } catch (error) {
      toast.warning("Lỗi khi lấy danh sách nhóm");
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchGroupsSmart();
    // eslint-disable-next-line
  }, [isAdminOrTeacher, userClasses.length]);

  // tạo nhóm mới
  const handleCreateGroup = async (groupData) => {
    try {
      await createGroup(groupData);
      await fetchGroupsSmart();
      toast.success("Tạo nhóm thành công!");
      // Reset filter về tất cả sau khi tạo nhóm mới (tuỳ ý)
      // setFilterClassId("");
    } catch (error) {
      console.log(error);
      toast.error("Không thể tạo nhóm");
    }
  };

  // cập nhật nhóm
  const handleUpdateGroup = async (groupId, updatedGroup) => {
    try {
      await updateGroup(groupId, updatedGroup);
      await fetchGroupsSmart();
      toast.success("Cập nhật nhóm thành công!");
    } catch (error) {
      toast.error("Cập nhật nhóm học thất bại!");
    }
  };

  // xóa nhóm
  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa nhóm này này?"
    );
    if (!confirmDelete) return;
    try {
      await deleteGroup(groupId);
      await fetchGroupsSmart();
      toast.success("Xóa nhóm thành công");
    } catch (error) {
      toast.error("Không thể xóa nhóm");
    }
  };

  // tham gia nhóm
  const handleJoinGroup = async (groupId) => {
    try {
      await joinGroup(groupId);
      await fetchGroupsSmart();
      toast.success("Tham gia nhóm thành công!");
    } catch (error) {
      toast.error("Không thể tham gia nhóm");
    }
  };

  // rời nhóm
  const handleLeaveGroup = async (groupId) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn rời nhóm này?");
    if (!confirmDelete) return;
    try {
      await leaveGroup(groupId);
      await fetchGroupsSmart();
      toast.success("Rời khỏi nhóm thành công!");
    } catch (error) {
      toast.error("Không thể rời nhóm");
    }
  };

  const handleOpenEditModal = (groupId) => {
    const groupToEdit = groups.find((group) => group._id === groupId);
    setSelectedGroup(groupToEdit);
    setShowEditModal(true);
  };

  // Xem group (placeholder)
  const handleViewGroup = async (groupId) => {
    // Lấy thông tin lớp để lấy tên nhóm
    const groupDetails = groups.find((c) => c._id === groupId);
    setModalGroupName(groupDetails?.nameClass || "");
    setModalGroupId(groupId);
    setShowMembersModal(true);
    try {
      // Gọi API lấy danh sách thành viên
      const members = await getGroupMembers(groupId);
      setModalMembers(members);
    } catch (error) {
      setModalMembers([]);
      toast.error("Không thể lấy danh sách thành viên lớp này!");
    }
  };

  // Xóa thành viên khỏi nhóm (chỉ admin)
  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người này khỏi lớp?"))
      return;
    try {
      await removeMemberFromGroup(modalGroupId, userId);
      setModalMembers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("Đã xóa thành viên khỏi lớp!");
    } catch (e) {
      toast.error("Xóa thành viên thất bại!");
    }
  };

  // ---- CHỨC NĂNG TÌM KIẾM NHÓM + LỌC LỚP HỌC ----
  const filteredGroups = groups.filter((groupItem) => {
    // Nếu đang chọn "Tất cả lớp học", hiển thị tất cả nhóm
    if (!filterClassId) {
      return (
        groupItem.nameGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Nếu đã chọn lớp học, chỉ hiện nhóm thuộc lớp đó
    return (
      (groupItem.classId === filterClassId ||
        groupItem.classId?._id === filterClassId) && // trường hợp classId là object
      (groupItem.nameGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupItem.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  // -------------------------------

  // Xử lý lọc nhóm khi chọn lớp học ở CreateGroup
  const handleFilterGroupByClass = (classId) => {
    setFilterClassId(classId);
  };

  // (Nếu cần chuyển view class)
  const handleViewClass = (classId) => {
    // Xử lý chuyển trang hoặc mở modal về lớp
  };

  return (
    <>
      <main className="flex-grow container mx-auto px-36 py-6 mt-14">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {isAdmin ? "Quản lý nhóm" : " Nhóm của tôi"}
          </h2>
          <div className="flex space-x-2">
            {/* Lọc lớp học nằm cạnh ô tìm kiếm */}
            {(isAdmin || isMemberOrTeacher) && ( // Hiện thị select box nếu là admin HOẶC giáo viên/thành viên
              <select
                id="filterClassId"
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                className="px-3 py-2 border rounded"
                style={{ minWidth: 160 }}
              >
                <option value="">Tất cả lớp học</option>
                {/* Lựa chọn lớp học sẽ dựa trên vai trò */}
                {(isAdmin ? classes : userClasses).map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.nameClass || cls.name}{" "}
                    {/* Dùng nameClass hoặc name tùy thuộc vào dữ liệu */}
                  </option>
                ))}
              </select>
            )}
            <input
              id="groupSearch"
              type="text"
              placeholder="Tìm kiếm nhóm"
              className="px-3 py-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {isAdmin && (
            <CreateGroup
              onCreate={handleCreateGroup}
              onFilter={handleFilterGroupByClass} // truyền hàm lọc lớp học xuống cho CreateGroup
            />
          )}

          {isMemberOrTeacher && (
            <div className="lg:col-span-1">
              {/* Lớp học của tôi */}
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

              {/* Nhóm của tôi */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                  Nhóm của tôi đã tham gia
                </h3>
                <ul id="userGroupsList" className="divide-y">
                  {userGroup.length > 0 ? (
                    userGroup.map((groupItem) => (
                      <li key={groupItem._id} className="py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {groupItem.nameGroup}
                            </div>
                            <div className="text-xs text-gray-500">
                              <i className="fas fa-users mr-2"></i>
                              <span>
                                {groupItem.members?.length || 0} thành viên
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-center text-gray-500">
                      <i className="fas fa-info-circle mr-2"></i> Bạn chưa tham
                      gia nhóm nào.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div className="lg:col-span-3">
            <GroupsList
              groups={filteredGroups} // Dùng danh sách đã lọc theo từ khóa và classId
              onJoinGroup={handleJoinGroup}
              onLeaveGroup={handleLeaveGroup}
              onDeleteGroup={handleDeleteGroup}
              onViewGroup={handleViewGroup}
              onUpdateGroup={handleOpenEditModal}
            />
          </div>
        </div>

        <UpdateGroup
          onUpdateGroup={handleUpdateGroup}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          groupData={selectedGroup}
        />
      </main>
      <GroupMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={modalMembers}
        groupName={modalGroupName}
        onRemoveMember={handleRemoveMember}
        isAdmin={isAdmin}
      />
      <ToastContainer />
    </>
  );
}

export default GroupPage;
