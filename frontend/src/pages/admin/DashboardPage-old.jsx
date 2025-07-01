import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layouts/Sidebar";
import { Outlet } from "react-router-dom";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 0,
    totalClasses: 0,
  });

  useEffect(() => {
    fetch("http://localhost:4000/counts/all") // Đổi URL theo API của bạn
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Nội dung chính */}

      <main className="flex-1 ml-64 p-6 bg-gray-100 overflow-auto mt-14">
        {/* Hiển thị số lượng thống kê */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">Người dùng</h2>
            <p className="text-xl">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">Bài viết</h2>
            <p className="text-xl">{stats.totalPosts}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">Lớp học</h2>
            <p className="text-xl">{stats.totalClasses}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">Nhóm</h2>
            <p className="text-xl">{stats.totalGroups}</p>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
export default DashboardPage;
