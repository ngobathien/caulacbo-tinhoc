import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Group from "../models/Group.js"; // Thêm nếu cần kiểm tra group thuộc class
import User from "../models/User.js"; // Thêm nếu cần kiểm tra user có phải là thành viên của group

import mongoose from "mongoose";
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

class PostController {
  // Lấy tất cả bài viết
  // Lấy tất cả bài viết, có thể lọc theo classId hoặc groupId nếu cần
  async getAllPost(req, res) {
    try {
      const posts = await Post.find()
        .populate("authorId", "name username email _id avatar")
        .populate("classId")
        .populate("groupId")
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy bài viết", error });
    }
  }

  // lấy bài viết theo id bài viết
  async getPostById(req, res) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const post = await Post.findById(id)
        .populate("authorId", "name username email _id avatar")
        .populate("classId")
        .populate("groupId")
        .lean();

      if (!post) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      res.status(200).json(post);
    } catch (error) {
      console.error("Lỗi server:", error);
      res.status(500).json({ message: "Lỗi server", error });
    }
  }

  // Thêm bài viết
  // async createPost(req, res) {
  //   try {
  //     const { title, content, scope, classId, groupId } = req.body;

  //     if (!title || !content || !scope) {
  //       return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
  //     }

  //     // Cho phép admin tạo post ở bất cứ lớp/nhóm nào
  //     const isAdmin = req.user.role === "admin";

  //     // Nếu là scope class, kiểm tra quyền
  //     if (scope === "class") {
  //       // Nếu không phải admin thì kiểm tra joinClass
  //       if (
  //         !isAdmin &&
  //         (!classId ||
  //           !req.user.joinClass.map(String).includes(String(classId)))
  //       ) {
  //         return res.status(403).json({ message: "Bạn không thuộc lớp này" });
  //       }

  //       // Nếu chọn nhóm thì phải thuộc nhóm của lớp đó và user phải là thành viên (admin thì bỏ qua)
  //       if (groupId && !isAdmin) {
  //         if (!req.user.joinGroup.map(String).includes(String(groupId))) {
  //           return res
  //             .status(403)
  //             .json({ message: "Bạn không thuộc nhóm này" });
  //         }
  //         const group = await Group.findById(groupId);
  //         if (!group || group.classId.toString() !== String(classId)) {
  //           return res
  //             .status(403)
  //             .json({ message: "Nhóm này không thuộc lớp đã chọn" });
  //         }
  //       }
  //       // Nếu là admin, vẫn nên kiểm tra group có tồn tại và thuộc đúng lớp (để tránh lỗi dữ liệu)
  //       if (groupId && isAdmin) {
  //         const group = await Group.findById(groupId);
  //         if (!group) {
  //           return res.status(403).json({ message: "Nhóm không tồn tại" });
  //         }
  //         if (group.classId.toString() !== String(classId)) {
  //           return res
  //             .status(403)
  //             .json({ message: "Nhóm này không thuộc lớp đã chọn" });
  //         }
  //       }
  //     }

  //     const existingPost = await Post.findOne({ title });
  //     if (existingPost) {
  //       return res.status(409).json({ message: "Tiêu đề này đã tồn tại!" });
  //     }
  //     const newPost = new Post({
  //       title,
  //       content,
  //       scope,
  //       classId: scope === "class" && isValidObjectId(classId) ? classId : null,
  //       groupId: scope === "class" && isValidObjectId(groupId) ? groupId : null,
  //       author: req.user.username,
  //       authorId: req.user._id,
  //     });
  //     const savedPost = await newPost.save();
  //     res.status(201).json(savedPost);
  //   } catch (error) {
  //     res.status(500).json({ message: "Lỗi khi thêm bài viết", error });
  //   }
  // }

  // Thêm bài viết
  async createPost(req, res) {
    try {
      const { title, content, scope, classId, groupId } = req.body;

      if (!title || !content || !scope) {
        return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
      }

      // Cho phép admin tạo post ở bất cứ lớp/nhóm nào
      const isAdmin = req.user.role === "admin";

      // Nếu là scope class, kiểm tra quyền
      if (scope === "class") {
        // Nếu không phải admin thì kiểm tra joinClass
        if (
          !isAdmin &&
          (!classId ||
            !req.user.joinClass.map(String).includes(String(classId)))
        ) {
          return res.status(403).json({ message: "Bạn không thuộc lớp này" });
        }

        // Nếu chọn nhóm thì phải thuộc nhóm của lớp đó và user phải là thành viên (admin thì bỏ qua)
        if (groupId && !isAdmin) {
          if (!req.user.joinGroup.map(String).includes(String(groupId))) {
            return res
              .status(403)
              .json({ message: "Bạn không thuộc nhóm này" });
          }
          const group = await Group.findById(groupId);
          if (!group || group.classId.toString() !== String(classId)) {
            return res
              .status(403)
              .json({ message: "Nhóm này không thuộc lớp đã chọn" });
          }
        }
        // Nếu là admin, vẫn nên kiểm tra group có tồn tại và thuộc đúng lớp (để tránh lỗi dữ liệu)
        if (groupId && isAdmin) {
          const group = await Group.findById(groupId);
          if (!group) {
            return res.status(403).json({ message: "Nhóm không tồn tại" });
          }
          if (group.classId.toString() !== String(classId)) {
            return res
              .status(403)
              .json({ message: "Nhóm này không thuộc lớp đã chọn" });
          }
        }
      }

      const existingPost = await Post.findOne({ title });
      if (existingPost) {
        return res.status(409).json({ message: "Tiêu đề này đã tồn tại!" });
      }
      const newPost = new Post({
        title,
        content,
        scope,
        classId: scope === "class" && isValidObjectId(classId) ? classId : null,
        groupId: scope === "class" && isValidObjectId(groupId) ? groupId : null,
        author: req.user.username,
        authorId: req.user._id,
      });
      const savedPost = await newPost.save();

      // Sửa TẠI ĐÂY: populate lại authorId, classId, groupId
      const populatedPost = await Post.findById(savedPost._id)
        .populate("authorId", "name username email _id avatar")
        .populate("classId")
        .populate("groupId");

      res.status(201).json(populatedPost);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi thêm bài viết", error });
    }
  }

  // Chỉnh sửa bài viết
  async editPost(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body; // Chỉ lấy title và content từ request body

      // Lấy bài viết hiện có để giữ lại scope, classId, groupId nếu không được gửi lên
      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      // Tạo đối tượng cập nhật
      const updateObj = {
        title,
        content,
        updatedAt: Date.now(),
        // Giữ nguyên scope, classId, groupId từ bài viết cũ
        scope: existingPost.scope,
        classId: existingPost.classId,
        groupId: existingPost.groupId,
      };

      const updatedPost = await Post.findByIdAndUpdate(id, updateObj, {
        new: true, // Trả về tài liệu đã cập nhật
        runValidators: true,
      });

      if (!updatedPost) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      // Quan trọng: Populate lại để trả dữ liệu đầy đủ cho FE
      const populatedPost = await Post.findById(updatedPost._id)
        .populate("authorId", "name username email _id avatar")
        .populate("classId") // Populate thông tin lớp
        .populate("groupId"); // Populate thông tin nhóm

      res.status(200).json(populatedPost); // Gửi về bài viết đã được populate
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi chỉnh sửa bài viết", error });
    }
  }
  // Xóa bài viết
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const deletedPost = await Post.findByIdAndDelete(id);
      if (!deletedPost) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      // Xóa tất cả bình luận liên quan đến bài viết
      await Comment.deleteMany({ post: id });
      res.status(200).json({ message: "Xóa bài viết thành công", deletedPost });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa bài viết", error });
    }
  }

  // Like hoặc Unlike bài viết
  async likePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      const isLiked = post.likes.some(
        (likeUserId) => likeUserId.toString() === userId.toString()
      );
      if (isLiked) {
        post.likes = post.likes.filter(
          (likeUserId) => likeUserId.toString() !== userId.toString()
        );
      } else {
        post.likes.push(userId);
      }
      await post.save();
      res.status(200).json({
        message: isLiked ? "Đã bỏ thích bài viết" : "Đã thích bài viết",
        likesCount: post.likes.length,
        liked: !isLiked,
        likes: post.likes,
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi like bài viết", error });
    }
  }
}

export default new PostController();
