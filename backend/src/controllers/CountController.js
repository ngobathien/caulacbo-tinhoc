import User from "../models/User.js";
import Post from "../models/Post.js";
import Group from "../models/Group.js";
import Class from "../models/Classes.js";

class CountController {
  // Đếm số lượng người dùng, bài viết, nhóm và lớp
  async count(req, res) {
    try {
      const userCount = await User.countDocuments();
      const postCount = await Post.countDocuments();
      const groupCount = await Group.countDocuments();
      const classCount = await Class.countDocuments();

      res.json({
        totalUsers: userCount,
        totalPosts: postCount,
        totalGroups: groupCount,
        totalClasses: classCount,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CountController();
