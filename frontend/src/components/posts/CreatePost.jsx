import React, { useState, useEffect, useRef } from "react";
import { getUserClasses, getClass } from "../../services/classesService";
import { getGroupsUserJoined, getGroups } from "../../services/groupService";
import { toast } from "react-toastify";
import { FaRegSmile, FaCheckCircle } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react"; // npm install emoji-picker-react
import Confetti from "react-confetti"; // npm install react-confetti

function CreatePost({ onCreate, userId }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState("public");
  const [classId, setClassId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsInClass, setGroupsInClass] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const formRef = useRef(null);
  const contentRef = useRef(null);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    setLoadingClasses(true);
    if (isAdmin) {
      getClass()
        .then((res) => setClasses(Array.isArray(res) ? res : []))
        .catch(() => setClasses([]))
        .finally(() => setLoadingClasses(false));
    } else {
      getUserClasses(userId)
        .then((res) => setClasses(Array.isArray(res) ? res : []))
        .catch(() => setClasses([]))
        .finally(() => setLoadingClasses(false));
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    setLoadingGroups(true);
    if (isAdmin) {
      getGroups()
        .then((res) => setGroups(Array.isArray(res) ? res : []))
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    } else {
      getGroupsUserJoined()
        .then((res) => setGroups(Array.isArray(res) ? res : []))
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!classId) {
      setGroupsInClass([]);
      setGroupId("");
      return;
    }
    const filtered = groups.filter(
      (g) => g.classId && (g.classId._id === classId || g.classId === classId)
    );
    setGroupsInClass(filtered);
    setGroupId("");
  }, [classId, groups]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    let data = { title, content, scope };
    if (scope === "class") {
      if (!classId) {
        toast.warning("Vui lòng chọn lớp học.");
        return;
      }
      data.classId = classId;
      if (groupId) data.groupId = groupId;
    }
    if (scope === "public") {
      data.classId = null;
      data.groupId = null;
    }
    if (groupId) {
      const group = groups.find((g) => g._id === groupId);
      if (group && (group.classId?._id || group.classId) !== classId) {
        toast.warning("Nhóm này không thuộc lớp đã chọn.");
        return;
      }
      data.groupId = groupId;
    }

    // Hiệu ứng thành công
    onCreate(data);
    setTitle("");
    setContent("");
    setScope("public");
    setClassId("");
    setGroupId("");
    setGroupsInClass([]);
    setShowSuccess(true);
    setShowConfetti(true);
    setTimeout(() => setShowSuccess(false), 1800);
    setTimeout(() => setShowConfetti(false), 2200);
  };

  // Nhấn Enter ở input hoặc textarea sẽ submit, trừ khi giữ Shift trong textarea
  const handleKeyDown = (e) => {
    if (
      (e.target.name === "title" && e.key === "Enter") ||
      (e.target.name === "content" && e.key === "Enter" && !e.shiftKey)
    ) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
      }
    }
  };

  // Chèn emoji vào vị trí con trỏ
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji || emojiData.native; // emoji-picker-react v4/v5 hỗ trợ .emoji
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setContent(
      (prev) => prev.slice(0, start) + emoji + prev.slice(end, prev.length)
    );
    setShowEmoji(false);
    setTimeout(() => textarea.focus(), 0);
  };

  if (loadingClasses) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 w-full text-center text-gray-500 ">
        Đang tải thông tin lớp học...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 w-full relative">
      {showConfetti && <Confetti numberOfPieces={180} recycle={false} />}
      <form ref={formRef} onSubmit={handleSubmit}>
        <h2 className="text-2xl text-center font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Hôm nay bạn muốn hỏi điều gì?
        </h2>

        {/* chọn radio */}
        {/* <div className="mb-4">
          <label className="block font-medium text-gray-800 dark:text-gray-200">
            Hiển thị bài viết:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="scope"
                value="public"
                checked={scope === "public"}
                onChange={() => {
                  setScope("public");
                  setClassId("");
                  setGroupId("");
                  setGroupsInClass([]);
                }}
              />
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                Tất cả
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="scope"
                value="class"
                checked={scope === "class"}
                onChange={() => setScope("class")}
              />
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                Lớp học
              </span>
            </label>
          </div>
        </div> */}

        {scope === "class" && (
          <>
            <div className="mb-4">
              <label className="block font-medium text-gray-800 dark:text-gray-200">
                Chọn lớp học:
              </label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="">-- Chọn lớp --</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.nameClass || cls.name}
                  </option>
                ))}
              </select>
            </div>
            {loadingGroups ? (
              <div className="mb-4 text-gray-500">Đang tải nhóm...</div>
            ) : (
              <div className="mb-4">
                <label className="block font-medium">
                  Chọn nhóm (không bắt buộc):
                </label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  <option value="">-- Không chọn nhóm --</option>
                  {groupsInClass.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.nameGroup || g.name}
                    </option>
                  ))}
                </select>
                {groupsInClass.length === 0 && (
                  <div className="text-gray-500 mt-2">
                    Không có nhóm nào trong lớp này.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mb-4 relative">
          <input
            name="title"
            type="text"
            placeholder="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border rounded mb-2"
            required
          />
          <div className="relative">
            <textarea
              name="content"
              placeholder="Nội dung bài đăng..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={contentRef}
              className="w-full px-4 py-2 border rounded h-24"
              required
            />
            <button
              type="button"
              className="absolute right-2 bottom-2 text-xl text-gray-400 hover:text-yellow-500 transition"
              onClick={() => setShowEmoji((v) => !v)}
              tabIndex={-1}
            >
              <FaRegSmile />
            </button>
            {showEmoji && (
              <div className="absolute bottom-10 right-0 z-50">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="light"
                  searchDisabled={false}
                />
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400">
            Nhấn <b>Enter</b> để gửi (Shift+Enter để xuống dòng trong nội dung)
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4 gap-4">
          {/* Chọn radio */}
          <div>
            <label className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
              Hiển thị bài viết:
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="public"
                  checked={scope === "public"}
                  onChange={() => {
                    setScope("public");
                    setClassId("");
                    setGroupId("");
                    setGroupsInClass([]);
                  }}
                  className="accent-blue-500"
                />
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  Tất cả
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="class"
                  checked={scope === "class"}
                  onChange={() => setScope("class")}
                  className="accent-blue-500"
                />
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  Lớp học
                </span>
              </label>
            </div>
          </div>

          {/* nút đăng bài */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 flex items-center gap-2 transition"
            disabled={showSuccess}
          >
            Đăng bài
            {showSuccess && (
              <FaCheckCircle
                className="ml-2 text-green-400 animate-bounce"
                size={22}
              />
            )}
          </button>
        </div>
        {showSuccess && (
          <div className="absolute top-2 right-6 flex items-center gap-2 text-green-600 text-lg animate-fade-in">
            <FaCheckCircle />
            <span>Đăng thành công!</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default CreatePost;
