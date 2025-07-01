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
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
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

  // useEffect(() => {
  //   const userData = localStorage.getItem("user");
  //   if (userData) {
  //     setUser(JSON.parse(userData));
  //   }
  // }, []);

  useEffect(() => {
    const updateUser = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    updateUser(); // Lấy user ngay khi mount

    window.addEventListener("user-updated", updateUser);

    return () => window.removeEventListener("user-updated", updateUser);
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
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm dark:bg-gray-900/90 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo + Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-xl font-semibold text-blue-700 dark:text-blue-400 tracking-tight"
            >
              Câu Lạc Bộ
            </Link>

            <nav className="hidden md:flex space-x-4">
              {[
                { to: "/", label: "Trang chủ" },
                { to: "/classes", label: "Lớp học" },
                { to: "/groups", label: "Nhóm" },
                { to: "/exercises", label: "Bài tập" },
                ...(isAdmin ? [{ to: "/dashboard", label: "Quản trị" }] : []), // 🔥 Chỉ thêm nếu isAdmin = true
                { to: "/about", label: "Giới thiệu" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    location.pathname === to
                      ? "bg-blue-500 text-white dark:bg-blue-500"
                      : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Dark Mode + User */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 12.79A9 9 0 0111.21 3a1 1 0 00-1.15 1.31A7 7 0 0012 21a7 7 0 009.69-7.64 1 1 0 00-1.31-1.15z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-800 dark:text-gray-100"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span className="hidden md:inline text-gray-800 dark:text-gray-200">
                    Xin chào,{" "}
                    {user.role === "teacher"
                      ? `giáo viên ${user.username}`
                      : user.role === "admin"
                      ? `Quản trị viên ${user.username}`
                      : `người dùng ${user.username || "Người dùng"}`}
                  </span>

                  <UserAvatar
                    user={user}
                    size="h-9 w-9 rounded-full ring-2 ring-blue-500 dark:ring-blue-300"
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-20">
                    <Link
                      to={`/profile/${userId}`}
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Hồ sơ cá nhân
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Quản trị
                      </Link>
                    )}
                    <div className="border-t dark:border-gray-700 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
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
