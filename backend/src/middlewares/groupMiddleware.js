import Class from "../models/Classes.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Group from "../models/Group.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Không có token, truy cập bị từ chối" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

export const checkIsAdminOrTeacher = (req, res, next) => {
  const { role } = req.user;
  if (role === "admin" || role === "teacher") {
    return next();
  }
  res.status(403).json({ message: "Không có quyền thực hiện thao tác này!" });
};

// Middleware kiểm tra xem người dùng có phải là admin hay không
// Nếu có, cho phép tiếp tục; nếu không, trả về lỗi 403
export const checkIsAdmin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Chỉ admin được phép thực hiện hành động này.",
    });
  }
};

export const checkIsGroupMember = async (req, res, next) => {
  try {
    const { id } = req.params; // Lấy ID nhóm từ URL
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Nhóm không tồn tại" });
    }

    // Kiểm tra nếu người dùng có trong danh sách thành viên nhóm
    const isMember = group.members.includes(userId);
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Bạn không phải thành viên của nhóm này" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Lỗi kiểm tra thành viên nhóm", error });
  }
};

export const checkIsClassMember = async (req, res, next) => {};
// export const checkIsClassMember = async (req, res, next) => {
//   try {
//     const { classId } = req.body || req.params;
//     const userId = req.user._id;

//     const classData = await Class.findById(classId);
//     if (!classData) {
//       return res.status(404).json({ message: "Lớp học không tồn tại" });
//     }

//     const isMember = classData.members.includes(userId);
//     if (!isMember) {
//       return res
//         .status(403)
//         .json({ message: "Bạn không phải thành viên của lớp này" });
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi kiểm tra thành viên lớp học", error });
//   }
// };
