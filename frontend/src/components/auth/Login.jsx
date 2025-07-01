import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Kiểm tra nếu đã đăng nhập thì redirect về trang chủ
  useEffect(() => {
    const token = localStorage.getItem("token");
    // hoặc kiểm tra localStorage.getItem("userId") hoặc "user"
    if (token) {
      navigate("/", { replace: true }); // chuyển hướng về trang chủ
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu!");
      return;
    }

    try {
      const userData = await login({ email, password });

      localStorage.setItem("user", JSON.stringify(userData.user));
      localStorage.setItem("userId", userData.user._id);
      localStorage.setItem("token", userData.user.token);
      localStorage.setItem("role", userData.user.role);
      localStorage.setItem("avatar", userData.user.avatar);

      toast.success("Đăng nhập thành công!");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại!";
      toast.error(msg);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-bold text-center mb-4">Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          id="password"
          type="password"
          placeholder="Mật khẩu"
          className="w-full px-4 py-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          id="loginBtn"
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Đăng nhập
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
