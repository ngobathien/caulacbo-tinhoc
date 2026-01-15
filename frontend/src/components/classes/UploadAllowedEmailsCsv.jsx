import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * UploadAllowedEmailsCsv:
 * - Nút ban đầu là "Tải file lên", nếu đã upload file (dựa vào prop initialUploaded hoặc trạng thái mới upload) thì thành "Tải lại file".
 * - Khi nhấn, luôn mở dialog chọn file, upload file mới lên server.
 * - Sau khi upload thành công, luôn chuyển thành "Tải lại file" (kể cả reload trang).
 */
function UploadAllowedEmailsCsv({ classId, initialUploaded, onSuccess }) {
  const fileInputRef = useRef();
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(initialUploaded || false);

  // Cập nhật trạng thái nếu initialUploaded thay đổi từ props (khi reload/lấy danh sách mới)
  useEffect(() => {
    setHasUploaded(initialUploaded || false);
  }, [initialUploaded]);

  // Khi nhấn nút sẽ mở dialog chọn file
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset để chọn lại file cũ nếu muốn
      fileInputRef.current.click();
    }
  };

  // Khi chọn file thì upload lên server
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();

    // csv là tên sẽ dùng cho  uploadCsv.single("csv") multer ở backend
    formData.append("csv", file);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(
        `${API_URL}/classes/${classId}/upload-allowed`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(res.data.message || "Upload thành công!");
      setHasUploaded(true); // Đã upload, nút luôn thành "Tải lại file"
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra khi upload file!"
      );
    } finally {
      setIsUploading(false);
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {isUploading ? (
          "Đang upload..."
        ) : hasUploaded ? (
          <>
            <i className="fas fa-sync-alt mr-1"></i>Tải lại file
          </>
        ) : (
          <>
            <i className="fas fa-upload mr-1"></i>Tải file lên
          </>
        )}
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}

export default UploadAllowedEmailsCsv;
