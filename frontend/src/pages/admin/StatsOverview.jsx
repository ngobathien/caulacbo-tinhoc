import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaFileAlt,
  FaChalkboardTeacher,
  FaUsersCog,
} from "react-icons/fa"; // Import icon

function StatsOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 0,
    totalClasses: 0,
  });

  useEffect(() => {
    fetch("http://localhost:4000/counts/all")
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
      {/* Card Thống Kê */}
      {[
        {
          title: "Người dùng",
          value: stats.totalUsers,
          icon: <FaUsers size={30} />,
          color: "bg-blue-500",
          glow: "shadow-blue-500/50",
        },
        {
          title: "Bài viết",
          value: stats.totalPosts,
          icon: <FaFileAlt size={30} />,
          color: "bg-green-500",
          glow: "shadow-green-500/50",
        },
        {
          title: "Lớp học",
          value: stats.totalClasses,
          icon: <FaChalkboardTeacher size={30} />,
          color: "bg-purple-500",
          glow: "shadow-purple-500/50",
        },
        {
          title: "Nhóm",
          value: stats.totalGroups,
          icon: <FaUsersCog size={30} />,
          color: "bg-red-500",
          glow: "shadow-red-500/50",
        },
      ].map((stat, index) => (
        <div
          key={index}
          className={`p-6 rounded-xl ${stat.color} text-white shadow-lg hover:shadow-xl ${stat.glow} transition transform hover:scale-105 dark:shadow-none flex flex-col items-center`}
        >
          {stat.icon} {/* Hiển thị icon */}
          <h2 className="text-lg font-semibold mt-2">{stat.title}</h2>
          <p className="text-3xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsOverview;
