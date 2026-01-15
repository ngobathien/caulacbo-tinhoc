import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UserAvatar from "../users/UserAvatar";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false); // Dùng để điều khiển menu mobile
  const [userMenuOpen, setUserMenuOpen] = useState(false); // Dùng để điều khiển menu user dropdown
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
    setUserMenuOpen(false); // Đóng menu sau khi đăng xuất
    nav("/login");
  };

  // Nút chuyển chế độ tối/sáng
  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  // Toggle menu mobile
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm dark:bg-gray-900/90 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-semibold text-blue-700 dark:text-blue-400 tracking-tight"
          >
            Câu Lạc Bộ
          </Link>

          {/* Navigation (Desktop) - Ẩn trên mobile, hiện từ md trở lên */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {[
              { to: "/", label: "Trang chủ" },
              { to: "/classes", label: "Lớp học" },
              { to: "/groups", label: "Nhóm" },
              { to: "/exercises", label: "Bài tập" },
              ...(isAdmin ? [{ to: "/dashboard", label: "Quản trị" }] : []),
              { to: "/about", label: "Giới thiệu" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location.pathname === to
                    ? "bg-blue-500 text-white dark:bg-blue-500"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Dark Mode Toggle, User/Login, and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
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

            {/* User Menu / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span className="hidden sm:inline text-gray-800 dark:text-gray-200 text-sm">
                    {" "}
                    Xin chào,{" "}
                    {user.role === "teacher"
                      ? `giáo viên ${user.username}`
                      : user.role === "admin"
                      ? `Quản trị viên ${user.username}`
                      : `${user.username || "Người dùng"}`}
                  </span>

                  <UserAvatar
                    // src={user.avatar || "/default-avatar.png"}
                    user={user}
                    size="h-9 w-9 rounded-full ring-2 ring-blue-500 dark:ring-blue-300"
                  />
                  {/* hoặc */}
                  {/* <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username}
                    className="h-15 w-10 rounded-full object-cover"
                  /> */}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-20">
                    <Link
                      to={`/profile/${userId}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Hồ sơ cá nhân
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
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
              // Ẩn nút Đăng nhập trên màn hình mobile, chỉ hiện từ sm trở lên (đã có nút trong menu mobile)
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors hidden sm:block"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile Menu Button (Hamburger) - Chỉ hiện trên mobile, ẩn từ md trở lên */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors md:hidden"
              title="Menu"
            >
              {/* Biểu tượng Hamburger/Close (Dùng logic đơn giản) */}
              <svg
                className="w-5 h-5 text-gray-800 dark:text-gray-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? ( // Hiển thị X khi menu mở
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                ) : (
                  // Hiển thị Hamburger khi menu đóng
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden border-t dark:border-gray-700 pb-2">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {[
              { to: "/", label: "Trang chủ" },
              { to: "/classes", label: "Lớp học" },
              { to: "/groups", label: "Nhóm" },
              { to: "/exercises", label: "Bài tập" },
              ...(isAdmin ? [{ to: "/dashboard", label: "Quản trị" }] : []),
              { to: "/about", label: "Giới thiệu" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                // Thêm 'block' để mỗi link chiếm một dòng
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all ${
                  location.pathname === to
                    ? "bg-blue-500 text-white dark:bg-blue-500"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {label}
              </Link>
            ))}
            {!user && ( // Hiển thị nút Đăng nhập trong menu mobile nếu chưa đăng nhập
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 block w-full text-center px-4 py-2 rounded-md bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
