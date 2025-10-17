import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Giữ nguyên state loading
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true); // 1. Bắt đầu loading

    try {
      const userData = { username, email, password };

      // Gọi API đăng ký
      const response = await register(userData);

      if (response && response.message) {
        // Cập nhật form và thông báo
        setUsername("");
        setEmail("");
        setPassword("");

        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
        );

        // Chỉ gọi navigate một lần sau khi toast hiển thị
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error.message);

      // ✅ Bật lại xử lý thông báo lỗi (Error Toast)
      const errorMessage =
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
      setMessage(errorMessage); // Có thể dùng state 'message' nếu bạn muốn hiển thị lỗi trong form
    } finally {
      setLoading(false); // 2. Kết thúc loading (dù thành công hay thất bại)
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-bold text-center mb-4">Đăng ký</h2>
      <form onSubmit={handleRegister}>
        {/* username */}
        <input
          id="name"
          type="text"
          placeholder="Họ và Tên"
          className="w-full px-4 py-2 border rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading} // Vô hiệu hóa khi đang loading
        />

        {/* email */}
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} // Vô hiệu hóa khi đang loading
        />

        {/* password */}
        <input
          id="password"
          type="password"
          placeholder="Mật khẩu"
          className="w-full px-4 py-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading} // Vô hiệu hóa khi đang loading
        />

        <button
          id="registerBtn"
          type="submit"
          className={`w-full text-white py-2 rounded ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={loading} // ✅ Vô hiệu hóa nút khi đang loading
        >
          {/* ✅ Thay đổi nội dung nút tùy theo trạng thái loading */}
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
      {message && <p className="text-center mt-3 text-red-500">{message}</p>}
      <p className="text-center mt-3 text-sm">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-blue-500">
          Đăng nhập
        </Link>
      </p>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Register;
