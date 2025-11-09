import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdArticle,
  MdClass,
  MdMenu,
} from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const navItems = [
    { to: "", label: "Tổng quan", icon: <MdDashboard className="w-5 h-5" /> },
    {
      to: "users",
      label: "Quản lý người dùng",
      icon: <MdPeople className="w-5 h-5" />,
    },
    {
      to: "posts",
      label: "Quản lý bài viết",
      icon: <MdArticle className="w-5 h-5" />,
    },
    {
      to: "class",
      label: "Quản lý lớp học",
      icon: <MdClass className="w-5 h-5" />,
    },
  ];

  const current = location.pathname.replace(/^\/dashboard\/?/, "");

  // ✅ Đóng sidebar khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* ✅ Nút menu (hiện trên mobile, góc trái cố định) */}
      {/* Nút menu (mobile) dưới header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-16 left-4 z-50 inline-flex items-center p-2 text-gray-600 rounded-lg sm:hidden
             hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200
             dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <MdMenu className="w-6 h-6" />
      </button>

      {/* ✅ Overlay nền tối khi mở sidebar */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 sm:hidden"></div>
      )}

      {/* ✅ Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 w-60 h-screen pt-20 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setIsOpen(false)} // auto đóng khi chọn link
                  className={`flex items-center p-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    current === item.to
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-white font-semibold"
                      : "hover:bg-blue-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3 truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
