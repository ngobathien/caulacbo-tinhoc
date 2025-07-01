import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPeople, MdArticle, MdClass } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      to: "",
      label: "Tổng quan",
      icon: <MdDashboard className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "users",
      label: "Quản lý người dùng",
      icon: <MdPeople className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "posts",
      label: "Quản lý bài viết",
      icon: <MdArticle className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "class",
      label: "Quản lý lớp học",
      icon: <MdClass className="w-5 h-5 flex-shrink-0" />,
    },
  ];

  // Lấy phần sau '/admin' trong pathname
  // VD: '/admin/posts' => 'posts', '/admin' => ''
  const current = location.pathname.replace(/^\/dashboard\/?/, "");

  return (
    <aside
      id="logo-sidebar"
      className="fixed top-0 left-0 z-40 w-60 h-screen pt-20 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 shadow-lg sm:translate-x-0 transition-transform"
      aria-label="Sidebar"
    >
      <div className="h-full px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
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
  );
};

export default Sidebar;
