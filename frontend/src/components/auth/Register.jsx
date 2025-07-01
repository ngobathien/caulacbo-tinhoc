import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //   const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userData = { username, email, password };

      // Gọi API đăng ký
      const response = await register(userData);

      if (response && response.message) {
        // Cập nhật form và thông báo
        setUsername("");
        setEmail("");
        setPassword("");
        setMessage("");

        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
        );
        navigate("/login");
        // Sau khi đăng ký thành công, chuyển hướng đến trang login
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Đợi 2 giây để toast có thể hiển thị
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error.message);
      // setMessage(
      //   toast.error(
      //     error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      //   )
      // );
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
        />

        {/* email */}
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* password */}
        <input
          id="password"
          type="password"
          placeholder="Mật khẩu"
          className="w-full px-4 py-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          id="registerBtn"
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Đăng ký
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
