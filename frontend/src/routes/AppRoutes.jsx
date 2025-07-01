import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ClassesPage from "../pages/ClassesPage";
import GroupPage from "../pages/GroupPage";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import DashboardPage from "../pages/admin/DashboardPage";
import ManageUsersPage from "../pages/admin/ManageUsersPage";
import ManagePostsPage from "../pages/admin/ManagePostsPage";
import ProfilePage from "../pages/ProfilePage";
import ManageClassesPage from "../pages/admin/ManageClassesPage";
import AssignmentPage from "../pages/AssignmentPage";
import AboutPage from "../pages/admin/AboutPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/posts/:id" element={<HomePage />} />
    <Route path="/classes" element={<ClassesPage />} />
    <Route path="/profile/:userId" element={<ProfilePage />} />
    <Route path="/groups" element={<GroupPage />} />
    <Route path="/exercises" element={<AssignmentPage />} />
    <Route path="/about" element={<AboutPage />} />

    {/* admin */}
    <Route path="/dashboard" element={<DashboardPage />}>
      <Route path="users" element={<ManageUsersPage />} />
      <Route path="posts" element={<ManagePostsPage />} />
      <Route path="class" element={<ManageClassesPage />} />
    </Route>
    {/* Các trang đăng nhập & đăng ký có layout riêng */}
    <Route
      path="/login"
      element={
        <AuthLayout>
          <Login />
        </AuthLayout>
      }
    />
    <Route
      path="/register"
      element={
        <AuthLayout>
          <Register />
        </AuthLayout>
      }
    />
  </Routes>
);

export default AppRoutes;
