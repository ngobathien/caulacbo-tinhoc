import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaFileAlt,
  FaChalkboardTeacher,
  FaUsersCog,
} from "react-icons/fa"; // Import icon
import { getCount } from "../../services/countService";

function StatsOverview() {
  // const [stats, setStats] = useState({
  //   totalUsers: 0,
  //   totalPosts: 0,
  //   totalGroups: 0,
  //   totalClasses: 0,
  // });

  const [counts, setCounts] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 0,
    totalClasses: 0,
  });

  const fetchCounts = async () => {
    try {
      const countsData = await getCount();
      setCounts(countsData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  // useEffect(() => {
  //   fetch("http://localhost:4000/api/v1/counts/all")
  //     .then((response) => response.json())
  //     .then((data) => setStats(data))
  //     .catch((error) => console.error("Error fetching stats:", error));
  // }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
      {/* Card Thống Kê */}
      {[
        {
          title: "Người dùng",
          value: counts.totalUsers,
          icon: <FaUsers size={30} />,
          color: "bg-blue-500",
          glow: "shadow-blue-500/50",
        },
        {
          title: "Bài viết",
          value: counts.totalPosts,
          icon: <FaFileAlt size={30} />,
          color: "bg-green-500",
          glow: "shadow-green-500/50",
        },
        {
          title: "Lớp học",
          value: counts.totalClasses,
          icon: <FaChalkboardTeacher size={30} />,
          color: "bg-purple-500",
          glow: "shadow-purple-500/50",
        },
        {
          title: "Nhóm",
          value: counts.totalGroups,
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
