import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

class CommentController {
  // Lấy danh sách bình luận cho post
  async getComment(req, res) {
    try {
      const { postId } = req.query;
      let query = {};
      if (postId) query.post = postId;

      const comments = await Comment.find(query)
        .populate("author", "name username email _id avatar")
        .populate("reply", "author content")
        .sort({ createdAt: -1 });

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Thêm bình luận
  async addComment(req, res) {
    try {
      const { author, post, content, reply } = req.body;
      if (!author || !post || !content)
        return res.status(400).json({ message: "Thiếu dữ liệu!" });

      const newComment = new Comment({
        author,
        post,
        content,
        reply: reply || null,
      });
      await newComment.save();

      // Tăng số lượng bình luận và thêm comment vào mảng comments của post
      await Post.findByIdAndUpdate(post, {
        $inc: { commentsCount: 1 },
        $push: { comments: newComment._id },
      });

      // Populate trả về thông tin đầy đủ
      await newComment.populate("author", "name username email _id");
      await newComment.populate("reply", "author content");

      res
        .status(201)
        .json({ message: "Bình luận thành công!", comment: newComment });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Bình luận thất bại!", error: error.message });
    }
  }

  // Cập nhật bình luận
  async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      if (!content)
        return res.status(400).json({ message: "Thiếu nội dung cập nhật!" });
      const updated = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
      );
      if (!updated)
        return res.status(404).json({ message: "Không tìm thấy bình luận!" });
      res
        .status(200)
        .json({ message: "Cập nhật thành công!", comment: updated });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Xóa bình luận
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findById(commentId);
      if (!comment)
        return res.status(404).json({ message: "Bình luận không tồn tại!" });

      await Comment.findByIdAndDelete(commentId);

      // Giảm số lượng bình luận và xóa comment khỏi mảng comments của post
      await Post.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: -1 },
        $pull: { comments: commentId },
      });

      res.status(200).json({ message: "Xóa bình luận thành công!" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Xóa bình luận thất bại!", error: error.message });
    }
  }
}

export default new CommentController();
