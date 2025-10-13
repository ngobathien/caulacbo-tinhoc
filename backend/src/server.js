import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes/index.js";
import connectDB from "./config/db.js";

import dotenv from "dotenv";
dotenv.config(); // Load biến môi trường

// Khởi tạo ứng dụng Express
const app = express();

// Lấy cổng từ biến môi trường hoặc mặc định là 4000
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors()); // Cho phép tất cả các nguồn gốc truy cập vào API

// Middleware để phục vụ các tệp tĩnh từ thư mục uploads
app.use(
  "/avatars",
  express.static(path.join(process.cwd(), "uploads", "avatars"))
);

// Middleware để phục vụ các tệp tĩnh từ thư mục assignments
app.use(
  "/assignments",
  express.static(path.join(process.cwd(), "uploads", "assignments"))
); // serve file nộp bài

// kết nối đến cơ sở dữ liệu
connectDB();

// http://localhost:4000/
// Sử dụng router đã định nghĩa trong routes/index.js
const api = process.env.API_URL;
// console.log(api);
app.use(`${api}`, router);

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// test ip lan nội bộ
// app.listen(port, "0.0.0.0", () => {
//   console.log(`Example app listening at http://192.168.1.50:${port}`);
// });

// console.log(process.env.MONGODB_URI);
