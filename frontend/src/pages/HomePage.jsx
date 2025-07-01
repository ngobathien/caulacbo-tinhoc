import React, { useEffect, useState, useRef } from "react";
import CreatePost from "../components/posts/CreatePost";
import EditPost from "../components/posts/EditPost";
import PostList from "../components/posts/PostList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../services/postService";
import { useNavigate, useParams } from "react-router-dom";
import { getClass } from "../services/classesService";
import { getGroups, getGroupsUserJoined } from "../services/groupService";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsInClass, setGroupsInClass] = useState([]);
  const [scopeFilter, setScopeFilter] = useState("all");
  const [classIdFilter, setClassIdFilter] = useState("");
  const [groupIdFilter, setGroupIdFilter] = useState("");
  const [showAllGroups, setShowAllGroups] = useState(false);

  const [userClasses, setUserClasses] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const nav = useNavigate();
  const { id: routePostId } = useParams(); // Lấy ID bài viết từ URL

  const [internalModalPostId, setInternalModalPostId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const role = localStorage.getItem("role");
  const isTeacher = role === "teacher";
  const isMember = role === "user";
  const isMemberOrTeacher = isMember || isTeacher;
  const userId = localStorage.getItem("userId");

  const [detailPost, setDetailPost] = useState(null);

  const modalPostId = routePostId || internalModalPostId;

  // Ref để theo dõi liệu useEffect đã chạy lần đầu tiên chưa cho việc fetch lớp/nhóm
  const initialClassGroupFetchRef = useRef(false);

  // Fetch tất cả bài viết khi component mount
  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
    const fetchPosts = async () => {
      try {
        const data = await getPost();
        // Chỉ cập nhật state nếu dữ liệu thực sự khác
        if (JSON.stringify(data) !== JSON.stringify(posts)) {
          setPosts(data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        toast.error("Không thể tải bài viết!");
      }
    };
    fetchPosts();
  }, [user, nav, posts]);

  // Lấy danh sách lớp và nhóm phù hợp role
  useEffect(() => {
    const fetchClassesAndGroups = async () => {
      try {
        let classRes = [];
        let groupRes = [];

        if (isAdmin) {
          classRes = await getClass();
          groupRes = await getGroups();
        } else {
          classRes = await getClass();
          groupRes = await getGroupsUserJoined();
        }

        const newClasses = Array.isArray(classRes) ? classRes : [];
        const newGroups = Array.isArray(groupRes) ? groupRes : [];

        // Chỉ cập nhật state nếu dữ liệu thực sự thay đổi về nội dung
        setClasses((prevClasses) => {
          if (JSON.stringify(prevClasses) !== JSON.stringify(newClasses)) {
            return newClasses;
          }
          return prevClasses;
        });
        setGroups((prevGroups) => {
          if (JSON.stringify(prevGroups) !== JSON.stringify(newGroups)) {
            return newGroups;
          }
          return prevGroups;
        });

        if (!isAdmin && userId) {
          const filteredUserClasses = Array.isArray(classRes)
            ? classRes.filter(
                (c) => Array.isArray(c.members) && c.members.includes(userId)
              )
            : [];
          const filteredUserGroups = Array.isArray(groupRes)
            ? groupRes.filter(
                (g) => Array.isArray(g.members) && g.members.includes(userId)
              )
            : [];

          setUserClasses((prevUserClasses) => {
            if (
              JSON.stringify(prevUserClasses) !==
              JSON.stringify(filteredUserClasses)
            ) {
              return filteredUserClasses;
            }
            return prevUserClasses;
          });
          setUserGroups((prevUserGroups) => {
            if (
              JSON.stringify(prevUserGroups) !==
              JSON.stringify(filteredUserGroups)
            ) {
              return filteredUserGroups;
            }
            return prevUserGroups;
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy lớp/nhóm:", error);
        // Đảm bảo không gọi setState nếu đã là mảng rỗng để tránh vòng lặp trên lỗi
        setClasses((prevClasses) =>
          prevClasses.length > 0 ? [] : prevClasses
        );
        setGroups((prevGroups) => (prevGroups.length > 0 ? [] : prevGroups));
        setUserClasses((prevUserClasses) =>
          prevUserClasses.length > 0 ? [] : prevUserClasses
        );
        setUserGroups((prevUserGroups) =>
          prevUserGroups.length > 0 ? [] : prevUserGroups
        );
      }
    };

    // Chỉ chạy fetchClassesAndGroups khi isAdmin hoặc userId thay đổi,
    // hoặc khi nó chưa chạy lần đầu tiên.
    // Điều kiện `isAdmin !== null || userId !== null` giúp đảm bảo
    // fetch chỉ chạy khi `user` (và các biến liên quan) đã được xác định.
    if (
      !initialClassGroupFetchRef.current ||
      isAdmin !== null ||
      userId !== null
    ) {
      fetchClassesAndGroups();
      initialClassGroupFetchRef.current = true;
    }
  }, [isAdmin, userId]); // CHỈ PHỤ THUỘC VÀO isAdmin VÀ userId

  useEffect(() => {
    if (!classIdFilter) {
      setGroupsInClass([]);
      setGroupIdFilter("");
      return;
    }
    const filtered = groups.filter(
      (g) =>
        g.classId &&
        ((typeof g.classId === "object" && g.classId._id === classIdFilter) ||
          g.classId === classIdFilter)
    );
    // Chỉ cập nhật groupsInClass nếu có sự thay đổi
    setGroupsInClass((prevGroupsInClass) => {
      if (JSON.stringify(prevGroupsInClass) !== JSON.stringify(filtered)) {
        return filtered;
      }
      return prevGroupsInClass;
    });
    setGroupIdFilter("");
  }, [classIdFilter, groups]); // Đã bỏ groupsInClass khỏi dependencies

  // Helper: lấy tên lớp cho group (tìm trong classes)
  const getClassNameForGroup = (group) => {
    if (
      group.classId &&
      typeof group.classId === "object" &&
      group.classId.nameClass
    ) {
      return group.classId.nameClass || group.classId.name;
    }
    if (
      group.classId &&
      typeof group.classId === "object" &&
      group.classId.name
    ) {
      return group.classId.name;
    }
    if (group.classId && typeof group.classId === "string") {
      const found = classes.find((cls) => cls._id === group.classId);
      if (found) return found.nameClass || found.name;
    }
    return null;
  };

  // Quyền xem bài đăng cho người dùng thông thường (chỉ xem bài của lớp/nhóm mình tham gia)
  const canViewPostClassOrGroup = (post) => {
    if (post.scope === "public") return true;

    if (post.classId && !post.groupId) {
      const classId =
        typeof post.classId === "object" ? post.classId._id : post.classId;
      return userClasses.some((c) => c._id === classId);
    }
    if (post.groupId) {
      const groupId =
        typeof post.groupId === "object" ? post.groupId._id : post.groupId;
      return userGroups.some((g) => g._id === groupId);
    }
    return false;
  };

  // Lọc bài đăng theo filter
  const filteredPosts = posts.filter((post) => {
    if (isAdmin) {
      if (scopeFilter === "all") return true;
      if (scopeFilter === "class") {
        if (!classIdFilter) return false;
        if (groupIdFilter) {
          return (
            post.groupId &&
            ((typeof post.groupId === "string" &&
              post.groupId === groupIdFilter) ||
              (typeof post.groupId === "object" &&
                post.groupId._id === groupIdFilter)) &&
            ((typeof post.classId === "string" &&
              post.classId === classIdFilter) ||
              (typeof post.classId === "object" &&
                post.classId._id === classIdFilter))
          );
        }
        return (
          post.classId &&
          ((typeof post.classId === "string" &&
            post.classId === classIdFilter) ||
            (typeof post.classId === "object" &&
              post.classId._id === classIdFilter)) &&
          !post.groupId
        );
      }
      return true;
    }

    if (scopeFilter === "all") {
      return !post.classId && !post.groupId;
    }
    if (scopeFilter === "class") {
      if (!classIdFilter) return false;
      if (groupIdFilter) {
        return (
          post.groupId &&
          ((typeof post.groupId === "string" &&
            post.groupId === groupIdFilter) ||
            (typeof post.groupId === "object" &&
              post.groupId._id === groupIdFilter)) &&
          ((typeof post.classId === "string" &&
            post.classId === classIdFilter) ||
            (typeof post.classId === "object" &&
              post.classId._id === classIdFilter)) &&
          canViewPostClassOrGroup(post)
        );
      }
      return (
        post.classId &&
        ((typeof post.classId === "string" && post.classId === classIdFilter) ||
          (typeof post.classId === "object" &&
            post.classId._id === classIdFilter)) &&
        !post.groupId &&
        canViewPostClassOrGroup(post)
      );
    }
    return false;
  });

  // Khi nhập link /posts/:id mà bài viết không có trong filteredPosts, fetch riêng
  useEffect(() => {
    if (!modalPostId) {
      setDetailPost(null);
      return;
    }
    const foundInPosts = posts.find((p) => p._id === modalPostId);
    if (foundInPosts) {
      setDetailPost(foundInPosts);
    } else {
      getPostById(modalPostId)
        .then((data) => setDetailPost(data))
        .catch(() => {
          setDetailPost(null);
          if (routePostId) {
            nav("/");
            toast.error("Không tìm thấy bài viết này.");
          }
        });
    }
  }, [modalPostId, posts, routePostId, nav]);

  const renderCards = () => {
    if (isAdmin) {
      return (
        <>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Tất cả lớp học</h3>
            <div className="max-h-80 overflow-y-auto">
              <ul id="allClassesList" className="divide-y">
                {classes.length > 0 ? (
                  classes.map((classItem) => (
                    <li key={classItem._id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            <i className="fas fa-graduation-cap mr-3 text-blue-500"></i>
                            {classItem.nameClass || classItem.name}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-center text-gray-500">
                    <i className="fas fa-info-circle mr-2"></i> Không có lớp học
                    nào.
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Tất cả nhóm</h3>
            <div className="max-h-80 overflow-y-auto">
              <ul id="allGroupsList" className="divide-y">
                {groups.length > 0 ? (
                  groups.map((groupItem) => (
                    <li key={groupItem._id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            <i className="fas fa-users mr-3 text-green-500"></i>
                            {groupItem.nameGroup || groupItem.name}
                            {groupItem.classId && (
                              <span className="text-xs text-gray-600 ml-2">
                                (Lớp: {getClassNameForGroup(groupItem)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-center text-gray-500">
                    <i className="fas fa-info-circle mr-2"></i> Không có nhóm
                    nào.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      );
    } else if (isMemberOrTeacher) {
      const groupDisplay = showAllGroups ? userGroups : userGroups.slice(0, 5);
      return (
        <>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Lớp học của tôi</h3>
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
              <ul id="userClassesList" className="divide-y">
                {userClasses.length > 0 ? (
                  userClasses.map((classItem) => (
                    <li key={classItem._id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            <i className="fas fa-graduation-cap mr-3 text-blue-500"></i>
                            {classItem.nameClass || classItem.name}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-center text-gray-500">
                    <i className="fas fa-info-circle mr-2"></i> Bạn chưa tham
                    gia lớp nào.
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Nhóm của tôi</h3>
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
              <ul id="userGroupsList" className="divide-y">
                {userGroups.length > 0 ? (
                  groupDisplay.map((groupItem) => (
                    <li key={groupItem._id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            <i className="fas fa-users mr-3 text-green-500"></i>
                            {groupItem.nameGroup || groupItem.name}
                            {getClassNameForGroup(groupItem) && (
                              <span className="text-xs text-gray-600 ml-2">
                                (Lớp: {getClassNameForGroup(groupItem)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-center text-gray-500">
                    <i className="fas fa-info-circle mr-2"></i> Bạn chưa tham
                    gia nhóm nào.
                  </li>
                )}
              </ul>
            </div>
            {userGroups.length > 5 && (
              <div className="flex justify-center mt-2">
                <button
                  className="text-blue-500 hover:underline focus:outline-none"
                  onClick={() => setShowAllGroups((v) => !v)}
                >
                  {showAllGroups ? "Ẩn bớt" : "Xem thêm"}
                </button>
              </div>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  const renderPostFilter = () => (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 mb-4">
      <label className="font-medium text-gray-800 dark:text-gray-200">
        Hiển thị bài viết:
      </label>
      <div className="flex items-center gap-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="scopeFilter"
            value="all"
            checked={scopeFilter === "all"}
            onChange={() => {
              setScopeFilter("all");
              setClassIdFilter("");
              setGroupIdFilter("");
              setGroupsInClass([]);
            }}
          />
          <span className="ml-1 text-gray-800 dark:text-gray-200">Tất cả</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="scopeFilter"
            value="class"
            checked={scopeFilter === "class"}
            onChange={() => setScopeFilter("class")}
          />
          <span className="ml-1 text-gray-800 dark:text-gray-200">
            Lọc theo lớp/nhóm
          </span>
        </label>
      </div>
      {scopeFilter === "class" && (
        <>
          <select
            className="border px-2 py-1 rounded"
            value={classIdFilter}
            onChange={(e) => setClassIdFilter(e.target.value)}
          >
            <option value="">-- Chọn lớp --</option>
            {(isAdmin ? classes : userClasses).map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.nameClass || cls.name}
              </option>
            ))}
          </select>
          <select
            className="border px-2 py-1 rounded"
            value={groupIdFilter}
            onChange={(e) => setGroupIdFilter(e.target.value)}
            disabled={!classIdFilter || groupsInClass.length === 0}
          >
            <option value="">-- Không chọn nhóm --</option>
            {groupsInClass.map((g) => (
              <option key={g._id} value={g._id}>
                {g.nameGroup || g.name}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await createPost(postData);
      setPosts((prev) => [newPost, ...prev]);
      toast.success("Tạo bài đăng thành công");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warn("Tiêu đề đã tồn tại, vui lòng nhập tiêu đề khác.");
      } else {
        toast.error("Lỗi khi đăng bài!");
      }
      console.error("Lỗi khi đăng bài:", error.message);
    }
  };

  const handleUpdatePost = async (postId, updatedPost) => {
    try {
      const updated = await updatePost(postId, updatedPost);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, ...updated } : post
        )
      );
      toast.success("Bạn đã sửa bài viết thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error.message);
      toast.error("Lỗi khi cập nhật bài viết!");
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bài viết này?"
    );
    if (!confirmDelete) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success("Bạn đã xóa bài viết thành công");
    } catch (error) {
      console.error("Lỗi khi xóa:", error.message);
      toast.error("Lỗi khi xóa bài viết!");
    }
  };

  // Hàm này được truyền xuống PostList để cập nhật số like và mảng likes
  const handleLikeUpdate = (postId, liked, newLikesCount, newLikedUsers) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: newLikedUsers, // Cập nhật mảng likes
              likesCount: newLikesCount, // Cập nhật likesCount
            }
          : p
      )
    );
    // Nếu bài viết đang được mở trong modal, bạn cũng cập nhật detailPost
    if (modalPostId === postId) {
      setDetailPost((prevDetailPost) =>
        prevDetailPost
          ? {
              ...prevDetailPost,
              likes: newLikedUsers,
              likesCount: newLikesCount,
            }
          : prevDetailPost
      );
    }
  };

  // Hàm này được truyền xuống PostList, PostList sẽ gọi nó khi click vào bài viết
  // Nếu có routePostId (tức là đang ở URL /posts/:id), không làm gì cả
  // Nếu không, đặt internalModalPostId để mở modal mà không thay đổi URL
  const handleOpenModalFromList = (postId) => {
    if (routePostId) return;
    setInternalModalPostId(postId);
  };

  // Hàm này được truyền xuống PostList, PostList sẽ gọi nó khi đóng modal
  const handleCloseModalFromList = () => {
    if (routePostId) {
      // Nếu modal được mở từ URL, khi đóng modal sẽ về trang chủ
      nav("/");
    } else {
      // Nếu modal được mở nội bộ, chỉ cần reset state
      setInternalModalPostId(null);
    }
  };

  return (
    <>
      <main className="flex-grow container mx-auto px-36 py-6 mt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="w-full mb-6 ">
              {editingPost ? (
                <EditPost
                  editingPost={editingPost}
                  onUpdate={handleUpdatePost}
                  setEditingPost={setEditingPost}
                />
              ) : (
                <CreatePost onCreate={handleCreatePost} userId={user?._id} />
              )}
            </div>
            <div className="w-full">
              {renderPostFilter()}
              <PostList
                posts={filteredPosts}
                onDelete={handleDeletePost}
                onEdit={(post) => setEditingPost(post)}
                isAdmin={isAdmin}
                currentUser={user}
                viewMode="user"
                selectedPostId={modalPostId}
                onOpenModal={handleOpenModalFromList}
                onCloseModal={handleCloseModalFromList}
                detailPost={detailPost}
                onLikeUpdate={handleLikeUpdate} // Truyền handler đã cập nhật
              />
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
          <div className="space-y-6">{renderCards()}</div>
        </div>
      </main>
    </>
  );
}

export default HomePage;
