import React from "react";
import Sidebar from "../../components/layouts/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import StatsOverview from "./StatsOverview"; // Import component mới

function DashboardPage() {
  const location = useLocation(); // Kiểm tra URL hiện tại

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Nội dung chính */}
      <main className="flex-1 ml-64 p-6 bg-gray-100 overflow-auto mt-14">
        {/* Hiển thị số liệu thống kê chỉ khi ở trang Admin */}
        {location.pathname === "/dashboard" && <StatsOverview />}

        {/* Outlet - Chỉ hiển thị nội dung động của trang con */}
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardPage;
