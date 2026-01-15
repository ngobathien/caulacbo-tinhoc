import express from "express";
import cors from "cors";
import path from "path";
import router from "./routes/index.js";
import connectDB from "./config/db.js";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config(); // Load biến môi trường

// Khởi tạo ứng dụng Express
const app = express();

// Lấy cổng từ biến môi trường hoặc mặc định là 4000
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors()); // Cho phép tất cả các nguồn gốc truy cập vào API

// Middleware để phục vụ các tệp tĩnh từ thư mục uploads
// app.use(
//   "/avatars",
//   express.static(path.join(process.cwd(), "uploads", "avatars"))
// );

// // Middleware để phục vụ các tệp tĩnh từ thư mục assignments
// app.use(
//   "/assignments",
//   express.static(path.join(process.cwd(), "uploads", "assignments"))
// ); // serve file nộp bài

// kết nối đến cơ sở dữ liệu
connectDB();

// http://localhost:4000/
// Sử dụng router đã định nghĩa trong routes/index.js
const api = process.env.API_URL || "/api/v1";

// rate limit api
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // message: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.",
  handler: (req, res) => {
    res.status(429).json({
      message: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.",
    });
  },
});

// app.use(limiter);

app.use(`${api}`, limiter, router);

app.set("trust proxy", 1);

// test
app.get("/", (req, res) => {
  // req.ip đã lấy IP client thật nhờ trust proxy
  let ip = req.ip;

  // Chuẩn hóa IPv4-mapped IPv6 ::ffff:127.0.0.1 -> 127.0.0.1
  if (ip.startsWith("::ffff:")) ip = ip.split("::ffff:")[1];
  if (ip === "::1") ip = "127.0.0.1"; // localhost

  console.log("IP của client:", ip);
  res.send(`IP của bạn là: ${ip}`);
});

// Start server
// comment tạm thời để deploy vercel
// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

// lệnh này dùng cho deploy vercel
export default app;
// console.log(process.env.URL_CLIENT);
