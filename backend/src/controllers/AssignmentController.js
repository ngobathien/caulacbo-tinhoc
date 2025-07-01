import Assignment from "../models/Assignment.js";
import Group from "../models/Group.js";
import Submission from "../models/Submission.js";

class AssignmentController {
  // GET /assignments?groupId=xxx&classId=yyy
  // // Lấy danh sách bài tập theo groupId và classId
  // Nếu là user thường, chỉ trả bài tập của các group user đã join
  async getAssignments(req, res) {
    try {
      const { groupId, classId } = req.query;
      const user = req.user;
      let filter = {};
      if (classId) filter.classId = classId;
      if (groupId) filter.groupId = groupId;

      // Nếu là user thường, chỉ trả bài tập của các group user đã join
      if (user.role === "user" && user.role === "teacher") {
        // Lấy danh sách group user đã join
        // Giả sử user.joinGroups lưu mảng groupId, hoặc đọc từ group.members
        // Bạn có thể thay đổi tùy DB của bạn
        let joinedGroupIds = [];
        // 1. Nếu user lưu joinGroups
        if (user.joinGroups && Array.isArray(user.joinGroups)) {
          joinedGroupIds = user.joinGroups;
        } else {
          // 2. Nếu group lưu members
          const groups = await Group.find({ members: user._id }, "_id");
          joinedGroupIds = groups.map((g) => g._id);
        }
        // Nếu truyền groupId, kiểm tra user có join không
        if (groupId && !joinedGroupIds.map(String).includes(String(groupId))) {
          return res.json([]); // Không trả bài tập nếu chưa join group này
        }
        filter.groupId = groupId ? groupId : { $in: joinedGroupIds };
      }

      const assignments = await Assignment.find(filter)
        .populate("groupId", "nameGroup")
        .populate("classId", "nameClass")
        .populate("createdBy", "username email");
      res.json(assignments);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to get assignments", error: error.message });
    }
  }

  // Tạo bài tập mới
  async createAssignment(req, res) {
    try {
      const { title, description, dueDate, classId, groupId } = req.body;
      const createdBy = req.user._id;
      if (!title || !classId) {
        // <-- CHỈ BẮT BUỘC title, classId
        return res.status(400).json({ message: "Thiếu trường bắt buộc" });
      }
      const assignmentData = {
        title,
        description,
        dueDate,
        classId,
        createdBy,
      };
      if (groupId) assignmentData.groupId = groupId; // <-- CHỈ THÊM groupId nếu có

      const assignment = new Assignment(assignmentData);
      await assignment.save();
      res.status(201).json(assignment);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create assignment", error: error.message });
    }
  }

  // PUT /assignments/:id
  async updateAssignment(req, res) {
    try {
      const { id } = req.params;
      const { title, description, dueDate, classId, groupId } = req.body;
      const a = await Assignment.findByIdAndUpdate(
        id,
        { title, description, dueDate, classId, groupId },
        { new: true }
      );
      if (!a) return res.status(404).json({ message: "Assignment not found" });
      res.json(a);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update assignment", error: error.message });
    }
  }

  // DELETE /assignments/:id
  // async deleteAssignment(req, res) {
  //   try {
  //     const a = await Assignment.findByIdAndDelete(req.params.id);
  //     if (!a) return res.status(404).json({ message: "Assignment not found" });
  //     res.json({ message: "Đã xóa!", assignment: a });
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: "Failed to delete assignment", error: error.message });
  //   }
  // }
  // DELETE /assignments/:id
  async deleteAssignment(req, res) {
    try {
      const assignmentId = req.params.id;

      // Tìm và xóa bài tập
      const a = await Assignment.findByIdAndDelete(assignmentId);
      if (!a) return res.status(404).json({ message: "Assignment not found" });

      // Xóa các submission liên quan đến assignment đó
      const deletedSubmissions = await Submission.deleteMany({ assignmentId });

      res.json({
        message: "Đã xóa bài tập và các bài nộp liên quan!",
        assignment: a,
        deletedSubmissionsCount: deletedSubmissions.deletedCount,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete assignment",
        error: error.message,
      });
    }
  }
}

export default new AssignmentController();
