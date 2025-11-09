import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BeatLoader } from "react-spinners"; // 👈 Import BeatLoader

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 👈 Thêm state loading
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập thì redirect về trang chủ
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu!");
      return;
    }

    setLoading(true); // 1. Bắt đầu loading

    try {
      const userData = await login({ email, password });

      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("userId", userData.user._id);
      localStorage.setItem("token", userData.user.token);
      localStorage.setItem("role", userData.user.role);
      localStorage.setItem("avatar", userData.user.avatar);

      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        navigate("/");
      }, 1000); // Giảm xuống 1s vì autoClose của toast là 1s
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(msg);
    } finally {
      setLoading(false); // 2. Kết thúc loading (dù thành công hay thất bại)
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-bold text-center mb-4">Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        {/* Email Input */}
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} // Vô hiệu hóa khi đang loading
        />
        {/* Password Input */}
        <input
          id="password"
          type="password"
          placeholder="Mật khẩu"
          className="w-full px-4 py-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading} // Vô hiệu hóa khi đang loading
        />

        {/* Nút Đăng nhập */}
        <button
          id="loginBtn"
          type="submit"
          className={`w-full text-white py-2 rounded transition duration-150 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={loading} // Vô hiệu hóa nút khi loading
        >
          {loading ? (
            // Hiển thị hiệu ứng loading xoay tròn
            <div className="flex items-center justify-center">
              <BeatLoader size={8} color={"#ffffff"} loading={loading} />
            </div>
          ) : (
            // Nội dung nút bình thường
            "Đăng nhập"
          )}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={1000} />
      <p className="text-center mt-3 text-sm">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="text-blue-500">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}

export default Login;
