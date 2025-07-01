import Group from "../models/Group.js";
import Class from "../models/Classes.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";

class GroupController {
  // lấy danh sách nhóm
  async getGroup(req, res) {
    try {
      const groups = await Group.find({})
        .populate("classId")
        .populate("members")
        .sort({ createdAt: -1 });
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách nhóm", error });
    }
  }

  // tạo nhóm mới
  async createGroup(req, res) {
    try {
      const { nameGroup, description, classId } = req.body;

      const existingClass = await Class.findById(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "nhóm học không tồn tại" });
      }

      const newGroup = await Group.create({
        nameGroup,
        description,
        classId,
        members: [],
      });

      res.status(201).json(newGroup);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo nhóm", error });
    }
  }

  // cập nhật thông tin nhóm
  async updateGroup(req, res) {
    try {
      const { id } = req.params;
      const { nameGroup, description } = req.body;

      const updatedGroup = await Group.findByIdAndUpdate(
        id,
        { nameGroup, description },
        { new: true }
      );

      if (!updatedGroup) {
        return res.status(404).json({ message: "Nhóm không tồn tại" });
      }

      res.status(200).json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật nhóm", error });
    }
  }

  // xóa nhóm
  async deleteGroup(req, res) {
    try {
      const { id } = req.params;

      const deletedGroup = await Group.findByIdAndDelete(id);
      if (!deletedGroup) {
        return res.status(404).json({ message: "Nhóm không tồn tại" });
      }

      await Assignment.deleteMany({ groupId: id });
      res.status(200).json({ message: "Xóa nhóm thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa nhóm", error });
    }
  }

  // tham gia nhóm
  async joinGroup(req, res) {
    try {
      const userId = req.user._id; // bạn cần middleware auth để có user.id từ token
      const groupId = req.params.id;

      // Kiểm tra tồn tại group
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });

      // Thêm user vào group.members nếu chưa có
      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();
      }

      // Thêm groupId vào user.joinGroup nếu chưa có
      const user = await User.findById(userId);
      if (!user.joinGroup.includes(groupId)) {
        user.joinGroup.push(groupId);
        await user.save();
      }

      res.status(200).json({ message: "Joined group successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // rời nhóm
  async leaveGroup(req, res) {
    try {
      const { id } = req.params; // ID của nhóm
      const userId = req.user._id;

      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ message: "Nhóm không tồn tại" });
      }

      // Xóa user khỏi group.members
      group.members = group.members.filter(
        (member) => member.toString() !== userId.toString()
      );
      await group.save();

      // Xóa groupId khỏi user.joinGroup
      await User.findByIdAndUpdate(userId, {
        $pull: { joinGroup: id },
      });

      res.status(200).json({ message: "Rời nhóm thành công", group });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi rời nhóm", error });
    }
  }

  // xem thông tin nhóm
  async viewGroup(req, res) {
    try {
      const { id } = req.params;

      const group = await Group.findById(id)
        .populate("members")
        .populate("classId");
      if (!group) {
        return res.status(404).json({ message: "Nhóm không tồn tại" });
      }

      res.status(200).json(group);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xem nhóm", error });
    }
  }

  // // Lấy tất cả nhóm mà user đã tham gia (không lọc theo class)
  async getGroupsUserJoined(req, res) {
    try {
      const userId = req.user._id;
      // Populate classId để trả về cả nameClass
      const groups = await Group.find({ members: userId }).populate("classId");
      res.status(200).json(Array.isArray(groups) ? groups : []);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi lấy nhóm bạn đã tham gia", error });
    }
  }

  // // Lấy các nhóm thuộc lớp học mà user đó đã tham gia
  async getGroupsOfClassUserJoined(req, res) {
    try {
      const userId = req.user._id;
      const classId = req.params.classId;
      const user = await User.findById(userId);

      // Nếu là admin hoặc giáo viên thì bỏ qua kiểm tra joinClass
      if (user.role !== "admin" && user.role !== "teacher") {
        if (
          !user.joinClass
            .map((id) => id.toString())
            .includes(classId.toString())
        ) {
          return res.status(403).json({
            message:
              "Bạn chưa tham gia lớp này! Hãy tham gia lớp trước khi xem nhóm.",
          });
        }
      }

      // Lấy nhóm thuộc classId đó
      const groups = await Group.find({ classId })
        .populate("classId")
        .populate("members", "-password");
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

  // API: Lấy danh sách thành viên của 1 nhóm (đã populate đầy đủ user)
  // GET /groups/:id/members
  async getGroupMembers(req, res) {
    try {
      const { id } = req.params;
      const groupData = await Group.findById(id)
        .populate("members", "username email role")
        .sort({ createdAt: -1 });
      if (!groupData) {
        return res.status(404).json({ message: "Không tìm thấy lớp học" });
      }
      // Trả về mảng members đã populate
      res.status(200).json(groupData.members || []);
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách thành viên của lớp",
        error: error.message,
      });
    }
  }
  // Xóa thành viên khỏi nhóm (chỉ admin)
  async removeMemberFromGroup(req, res) {
    try {
      // Chỉ cho phép admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Chỉ admin mới có quyền xóa thành viên khỏi nhóm!",
        });
      }

      const { id, userId } = req.params;
      const groupData = await Group.findById(id);
      if (!groupData) {
        return res.status(404).json({ message: "Không tìm thấy nhóm học" });
      }

      // Không cho xóa admin
      const userToRemove = await User.findById(userId);
      if (!userToRemove) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      if (userToRemove.role === "admin") {
        return res
          .status(403)
          .json({ message: "Không thể xóa admin khỏi nhóm" });
      }

      // Xóa khỏi thành viên nhóm
      groupData.members = groupData.members.filter(
        (member) => member.toString() !== userId.toString()
      );
      await groupData.save();

      // Xóa nhóm khỏi joinGroup của user
      userToRemove.joinGroup = userToRemove.joinGroup.filter(
        (cid) => cid.toString() !== id.toString()
      );
      await userToRemove.save();

      res.status(200).json({ message: "Đã xóa thành viên khỏi nhóm!" });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi xóa thành viên khỏi nhóm",
        error: error.message,
      });
    }
  }
}

export default new GroupController();
