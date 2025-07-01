import Post from "../models/Post.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, không được phép truy cập" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export const checkPostOwnerOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Bài viết không tồn tại" });
    }
    const isOwner = post.authorId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";
    if (isOwner || isAdmin) {
      return next();
    }
    return res
      .status(403)
      .json({ message: "Bạn không có quyền thực hiện thao tác này!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi kiểm tra quyền", error });
  }
};
