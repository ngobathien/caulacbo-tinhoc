import express from "express";
import GroupController from "../controllers/GroupController.js";
import {
  protect,
  checkIsAdminOrTeacher,
  checkIsGroupMember,
  checkIsAdmin,
} from "../middlewares/groupMiddleware.js";

const router = express.Router();

// routes group

// http://localhost:4000/groups/join/:id
// lấy tất cả nhóm
router.get("/", GroupController.getGroup);

// lấy nhóm học theo lớp học mà user đã tham gia
// http://localhost:4000/groups/of-class/:classId
router.get(
  "/of-class/:classId",
  protect,
  GroupController.getGroupsOfClassUserJoined
);

// user tham gia nhóm đó để hiển thị ở phần chọn danh mục cho bài đăng
router.get("/user/joined", protect, GroupController.getGroupsUserJoined);

// xem chi tiết nhóm đó
router.get("/:id", protect, checkIsGroupMember, GroupController.viewGroup);

// tham gia nhóm
router.post("/join/:id", protect, GroupController.joinGroup);

// rời nhóm học
router.post("/leave/:id", protect, GroupController.leaveGroup);

// tạo nhóm học, chỉ admin mới được phép
router.post("/", protect, checkIsAdmin, GroupController.createGroup);

// cập nhật nhóm học, admin hoặc teacher mới được phép
router.put("/:id", protect, checkIsAdminOrTeacher, GroupController.updateGroup);

// xóa nhóm học, chỉ admin mới được phép
router.delete("/:id", protect, checkIsAdmin, GroupController.deleteGroup);

// API: Lấy danh sách thành viên của 1 lớp (admin, teacher đều xem được)
router.get("/:id/members", protect, GroupController.getGroupMembers);

// API: Admin xóa thành viên khỏi nhóm
router.delete(
  "/:id/members/:userId",
  protect,
  checkIsAdmin,
  GroupController.removeMemberFromGroup
);

export default router;
