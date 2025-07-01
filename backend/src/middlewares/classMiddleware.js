// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Đảm bảo bạn có model User phù hợp

// Middleware để bảo vệ các route yêu cầu xác thực
// Kiểm tra token và xác thực người dùng
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm user theo ID từ token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Không tìm thấy người dùng." });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
  } else {
    res.status(401).json({ message: "Không có token, truy cập bị từ chối." });
  }
};

// Middleware kiểm tra xem người dùng có phải là admin hoặc teacher hay không
export const checkIsAdminOrTeacher = async (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "teacher")) {
    next();
  } else {
    res.status(403).json({
      message: "Chỉ admin hoặc teacher mới được phép thực hiện hành động này.",
    });
  }
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
