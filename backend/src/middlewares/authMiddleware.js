import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware xác thực token
export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Người dùng không tồn tại." });
      }
      next();
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc hết hạn." });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Không có token, không được phép." });
  }
};

// Middleware kiểm tra quyền admin
export const isAdmin = (req, res, next) => {
  //   console.log(req.user.role);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Chỉ admin mới được phép thực hiện hành động này." });
  }
};
