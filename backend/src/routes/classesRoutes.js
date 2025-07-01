import express from "express";
import ClassesController from "../controllers/ClassesController.js";
import {
  checkIsAdmin,
  checkIsAdminOrTeacher,
  protect,
} from "../middlewares/classMiddleware.js";
import uploadCsv from "../middlewares/uploadCsv.js"; // Giả sử bạn đã tạo middleware này để xử lý upload CSV

const router = express.Router();

// API: lấy các lớp mà user đã tham gia
// GET /classes/user/:userId
router.get("/user/:userId", ClassesController.getUserClasses);

// http://localhost:4000/classes
// lấy tất cả lớp học
router.get("/", ClassesController.getClasses);

// xem chi tiết lớp học đó
router.get("/:id", protect, ClassesController.viewClass);

// tham gia lớp học
router.post("/join/:id", protect, ClassesController.joinClass);

// rời lớp học
router.post("/leave/:id", protect, ClassesController.leaveClass);

// tạo lớp học, chỉ admin mới được phép
router.post("/", protect, checkIsAdmin, ClassesController.createClass);

// cập nhật lớp học, admin hoặc teacher mới được phép
router.put(
  "/:id",
  protect,
  checkIsAdminOrTeacher,
  ClassesController.updateClass
);

// xóa lớp học, chỉ admin mới được phép
router.delete("/:id", protect, checkIsAdmin, ClassesController.deleteClass);

// Thêm route cho admin upload allowed emails (CSV)
router.post(
  "/:id/upload-allowed",
  protect,
  checkIsAdmin, // chỉ admin
  uploadCsv.single("csv"),
  ClassesController.uploadAllowedList
);

// API: Lấy danh sách thành viên của 1 lớp (admin, teacher đều xem được)
router.get("/:id/members", protect, ClassesController.getClassMembers);

// API: Admin xóa thành viên khỏi lớp
router.delete(
  "/:id/members/:userId",
  protect,
  checkIsAdmin,
  ClassesController.removeMemberFromClass
);

export default router;
