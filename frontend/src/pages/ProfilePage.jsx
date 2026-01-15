import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserAvatar from "../components/users/UserAvatar";

const BASE_URL = import.meta.env.VITE_API_URL;

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  console.log(profile);
  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const response = await axios.get(`${BASE_URL}/users/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setProfile(response.data);
      setOriginalProfile(response.data);
      setLoading(false);
    } catch (error) {
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
      setLoading(false);
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const updateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("email", profile.email);
      formData.append("birthday", profile.birthday || "");
      formData.append("phone", profile.phone || "");
      formData.append("address", profile.address || "");
      formData.append("hometown", profile.hometown || "");

      if (avatarFile) {
        // avatar là tên sẽ dùng cho  uploadCsv.single("csv") multer ở backend
        formData.append("avatar", avatarFile);
      }

      const response = await axios.put(
        `${BASE_URL}/users/${profile._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfile(response.data.user);
      setOriginalProfile(response.data.user);

      // Cập nhật lại user mới vào localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("user-updated"));

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      setError("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      console.error("Lỗi khi cập nhật người dùng:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    await updateProfile();
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải hồ sơ...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-10">Không tìm thấy thông tin hồ sơ</div>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 mt-14">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
          Hồ sơ cá nhân
        </h2>
        <div className="mb-8 flex justify-center">
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer relative block"
          >
            <UserAvatar
              // user={{ ...profile, avatar: avatarPreview || profile.avatar }}
              user={profile}
              size="h-36 w-36"
            />
            {/* <img
              src={profile.avatar || "/default-avatar.png"}
              alt={profile.username}
              className="h-36 w-36 rounded-full object-cover"
            /> */}

            {isEditing && (
              <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md">
                <i className="fas fa-camera text-blue-600 text-xl"></i>
              </div>
            )}
          </label>
          {isEditing && (
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          )}
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <InputField
              label="Họ và tên"
              id="username"
              value={profile.username}
              disabled={!isEditing}
              onChange={handleChange}
              required
            />
            <InputField
              label="Email"
              id="email"
              value={profile.email}
              disabled
              readOnly
            />
            <InputField
              label="Ngày sinh"
              id="birthday"
              value={profile.birthday?.slice(0, 10) || ""}
              type="date"
              disabled={!isEditing}
              onChange={handleChange}
              placeholder="Chưa cập nhật"
            />
            <InputField
              label="Số điện thoại"
              id="phone"
              value={profile.phone || ""}
              disabled={!isEditing}
              onChange={handleChange}
              placeholder="Chưa cập nhật"
            />
            <InputField
              label="Địa chỉ"
              id="address"
              value={profile.address || ""}
              disabled={!isEditing}
              onChange={handleChange}
              className="md:col-span-2"
              placeholder="Chưa cập nhật"
            />
            <InputField
              label="Quê quán"
              id="hometown"
              value={profile.hometown || ""}
              disabled={!isEditing}
              onChange={handleChange}
              placeholder="Chưa cập nhật"
            />
            <InputField
              label="Vai trò"
              id="role"
              value={profile.role}
              disabled
              readOnly
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Chỉnh sửa
              </button>
            )}
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}

// InputField component với dark mode cho label
function InputField({
  label,
  id,
  value,
  onChange,
  disabled = false,
  type = "text",
  className = "",
  placeholder = "",
  required = false,
  readOnly = false,
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={disabled ? placeholder : ""}
        required={required}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white dark:bg-gray-800"
        }`}
      />
    </div>
  );
}

export default ProfilePage;
