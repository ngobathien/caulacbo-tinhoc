import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UserAvatar from "../users/UserAvatar";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Kiểm tra localStorage để giữ chế độ khi reload
    return localStorage.getItem("theme") === "dark";
  });
  const nav = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId");

  // Áp dụng class dark cho body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    nav("/login");
  };

  // Nút chuyển chế độ tối/sáng
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 text-white shadow-md z-50 dark:bg-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold">
              Câu Lạc Bộ
            </Link>
            {/* Navbar - Hiển thị trên màn hình lớn */}
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`px-2 py-1 rounded ${
                  location.pathname === "/"
                    ? "bg-blue-800 font-bold dark:bg-gray-700"
                    : "hover:bg-blue-700 dark:hover:bg-gray-800"
                }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/classes"
                className={`px-2 py-1 rounded ${
                  location.pathname === "/classes"
                    ? "bg-blue-800 font-bold dark:bg-gray-700"
                    : "hover:bg-blue-700 dark:hover:bg-gray-800"
                }`}
              >
                Lớp học
              </Link>
              <Link
                to="/groups"
                className={`px-2 py-1 rounded ${
                  location.pathname === "/groups"
                    ? "bg-blue-800 font-bold dark:bg-gray-700"
                    : "hover:bg-blue-700 dark:hover:bg-gray-800"
                }`}
              >
                Nhóm
              </Link>
              <Link
                to="/exercises"
                className={`px-2 py-1 rounded ${
                  location.pathname === "/exercises"
                    ? "bg-blue-800 font-bold dark:bg-gray-700"
                    : "hover:bg-blue-700 dark:hover:bg-gray-800"
                }`}
              >
                Bài tập
              </Link>
            </nav>
          </div>

          {/* Khu vực người dùng + dark mode */}
          <div className="flex items-center space-x-4">
            {/* Nút dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-blue-700 dark:hover:bg-gray-800 focus:outline-none"
              title={darkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
            >
              {darkMode ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path
                    d="M21 12.79A9 9 0 0111.21 3a1 1 0 00-1.15 1.31A7 7 0 0012 21a7 7 0 009.69-7.64 1 1 0 00-1.31-1.15z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="currentColor"
                  />
                  <path
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>

            {user ? (
              <>
                <span className="hidden md:inline">
                  Xin chào,{" "}
                  {user.role === "teacher"
                    ? `giáo viên ${user.username}`
                    : user.role === "admin"
                    ? `Quản trị viên ${user.username}`
                    : `người dùng ${user.username || "Người dùng"}`}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    <UserAvatar user={user} size="h-8 w-8" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      <Link
                        to={`/profile/${userId}`}
                        className="block px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Hồ sơ cá nhân
                      </Link>
                      {/* <Link
                        to="/members"
                        className="block px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Thành viên
                      </Link> */}
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Quản trị
                        </Link>
                      )}
                      <hr className="my-1 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-blue-700 rounded">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
