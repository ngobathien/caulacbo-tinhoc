import multer from "multer";
import path from "path";
import fs from "fs";

// Sử dụng multer để lưu avatar vào thư mục theo userId và email
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const userId = req.user._id.toString();
//     // Đảm bảo an toàn cho email trong tên thư mục
//     const safeEmail = req.user.email.replace(/[^a-zA-Z0-9@.]/g, "_");
//     const uploadDir = path.join("uploads", "avatars", `${userId}-${safeEmail}`);
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const userId = req.user._id.toString(); // Sửa tại đây!
//     const ext = path.extname(file.originalname);
//     cb(null, `${userId}-${Date.now()}${ext}`);
//   },
// });

// const uploadAvatar = multer({ storage });

const storage = multer.memoryStorage();

const uploadAvatar = multer({ storage });

export default uploadAvatar;
