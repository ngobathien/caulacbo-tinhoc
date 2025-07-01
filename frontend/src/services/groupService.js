import api from "./apiClient";

// Lấy nhóm thuộc 1 class mà user đã join
export const getGroupsOfClass = async (classId) => {
  if (!classId) {
    console.error("classId không hợp lệ:", classId);
    return [];
  }

  try {
    const response = await api.get(`/groups/of-class/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups of class:", error);
    throw error;
  }
};

// Lấy danh sách nhóm mà user, giáo viên đã tham gia
export const getGroupsUserJoined = async () => {
  try {
    const response = await api.get("/groups/user/joined");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching groups user joined:", error);
    return [];
  }
};

// Fetch all groups
export const getGroups = async () => {
  try {
    const response = await api.get("/groups");
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (groupData) => {
  try {
    const response = await api.post("/groups", groupData);
    return response.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Update an existing group
export const updateGroup = async (groupId, updatedGroup) => {
  try {
    const response = await api.put(`/groups/${groupId}`, updatedGroup);
    return response.data;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

// Delete a group
export const deleteGroup = async (groupId) => {
  try {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// View details of a specific group
export const viewGroup = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error viewing group:", error);
    throw error;
  }
};

// Join a group
export const joinGroup = async (groupId) => {
  try {
    const response = await api.post(`/groups/join/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};

// Leave a group
export const leaveGroup = async (groupId) => {
  try {
    const response = await api.post(`/groups/leave/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};

// Lấy thành viên của 1 nhóm
export const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data; // [{_id, username, email, role}]
  } catch (error) {
    console.error("Error fetching class members:", error);
    throw error;
  }
};

// Xóa thành viên khỏi nhóm (chỉ admin)
export const removeMemberFromGroup = async (groupId, userId) => {
  try {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing member from class:", error);
    throw error;
  }
};
