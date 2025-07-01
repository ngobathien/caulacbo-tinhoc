import Class from "../models/Classes.js";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Group from "../models/Group.js";
import { parse } from "csv-parse";
import Assignment from "../models/Assignment.js";

class ClassesController {
  // lấy tất cả danh sách lớp học
  async getClasses(req, res) {
    try {
      const classes = await Class.find().sort({ createdAt: -1 });
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Không thể lấy danh sách lớp học." });
    }
  }

  // Lấy các lớp mà user đã tham gia (KHÔNG cần req.user, chỉ lấy từ req.params.userId)
  async getUserClasses(req, res) {
    try {
      const userId = req.params.userId;
      const classes = await Class.find({ members: userId });
      res.status(200).json(Array.isArray(classes) ? classes : []);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Không thể lấy danh sách lớp của user." });
    }
  }

  // tạo lớp học mới
  async createClass(req, res) {
    try {
      const { nameClass, description } = req.body;

      if (!nameClass) {
        return res.json({ message: "Vui lòng nhập tên lớp" });
      }

      const existingClass = await Class.findOne({ nameClass });
      if (existingClass) {
        return res
          .status(409)
          .json({ message: "Tên lớp này đã tồn tại, vui lòng nhập tên khác!" });
      }

      const newClass = new Class({ nameClass, description });
      const saveClass = await newClass.save();
      res.status(201).json(saveClass);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Không thể tạo lớp học", error: error.message });
    }
  }

  // cập nhật thông tin lớp học
  async updateClass(req, res) {
    try {
      const { id } = req.params;
      const { nameClass, description } = req.body;
      // kiểm tra trùng tên lớp khác
      const existingClass = await Class.findOne({
        nameClass,
        _id: { $ne: id },
      });
      if (existingClass) {
        return res.status(409).json({ message: "Tên lớp đã tồn tại" });
      }

      //kiểm tra xem có tồn tại lớp học đó không và cập nhật dữ liệu mới
      const classData = await Class.findByIdAndUpdate(
        id,
        {
          nameClass: nameClass,
          description: description,
        },
        { new: true }
      );

      if (!classData) {
        res.status(404).json({ message: " Không tìm thấy bài viết" });
      }
      res.json(classData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // xóa lớp học
  // Xóa lớp học và tất cả nhóm thuộc lớp đó
  async deleteClass(req, res) {
    try {
      // Kiểm tra quyền (nên đặt ở middleware, nhưng nếu muốn kiểm tra lại)
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Chỉ admin mới được phép xóa lớp học này." });
      }

      const { id } = req.params;

      // Xóa tất cả Group thuộc về lớp học này
      await Group.deleteMany({ classId: id });

      // Xóa lớp học
      const classData = await Class.findByIdAndDelete(id);
      if (!classData) {
        return res
          .status(404)
          .json({ message: "Lớp học đã bị xóa hoặc không tìm thấy lớp học" });
      }

      await Assignment.deleteMany({ classId: id });
      res
        .status(200)
        .json({ message: "Xóa lớp học và tất cả nhóm thành công", classData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ==========================================================================
  // xem lớp học
  // GET /classes/:id
  async viewClass(req, res) {
    try {
      const classData = await Class.findById(req.params.id).populate(
        "members",
        "username email role"
      );

      if (!classData) {
        return res.status(404).json({ message: "Không tìm thấy lớp học" });
      }

      res.status(200).json(classData);
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy thông tin lớp học",
        error: error.message,
      });
    }
  }

  // tham gia lớp học
  async joinClass(req, res) {
    try {
      const classId = req.params.id;
      const userId = req.user._id;
      const user = await User.findById(userId);

      const classData = await Class.findById(classId);
      if (!classData)
        return res.status(404).json({ message: "Không tìm thấy lớp học" });

      // === KIỂM TRA allowedEmails ===
      if (
        Array.isArray(classData.allowedEmails) &&
        classData.allowedEmails.length > 0
      ) {
        if (!classData.allowedEmails.includes(user.email)) {
          return res.status(403).json({
            message:
              "Bạn không có quyền tham gia lớp này (email không nằm trong danh sách được phép).",
          });
        }
      }

      if (classData.members.includes(userId)) {
        return res.status(400).json({ message: "Bạn đã tham gia lớp học này" });
      }

      // Thêm user vào lớp + thêm lớp vào user
      classData.members.push(userId);
      await classData.save();

      // Nếu user đã có joinClass thì không push trùng
      if (!user.joinClass.includes(classId)) {
        user.joinClass.push(classId);
        await user.save();
      }

      res
        .status(200)
        .json({ message: "Tham gia lớp học thành công", class: classData });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi tham gia lớp học", error: error.message });
    }
  }

  // Upload allowedEmails CSV: thêm check cột email
  async uploadAllowedList(req, res) {
    try {
      const classId = req.params.id;
      if (!req.file) {
        return res.status(400).json({ message: "Chưa upload file CSV" });
      }

      // Log thông tin file, test
      // console.log("Thông tin file nhận được:", {
      //   originalname: req.file.originalname,
      //   mimetype: req.file.mimetype,
      //   size: req.file.size,
      // });

      const csvData = req.file.buffer.toString("utf-8");
      // log để test
      console.log("Nội dung file CSV:\n", csvData);

      parse(
        csvData,
        { columns: true, trim: true, skip_empty_lines: true },
        async (err, records) => {
          if (err) {
            return res
              .status(400)
              .json({ message: "Lỗi đọc file CSV", error: err.message });
          }
          if (!records[0]?.email) {
            return res
              .status(400)
              .json({ message: "File CSV phải có cột email!" });
          }

          // trích ra mảng các email từ từng dòng
          const emails = records
            .map((row) => row.email)
            .filter((email) => !!email);

          const updated = await Class.findByIdAndUpdate(
            classId,
            { allowedEmails: emails },
            { new: true }
          );
          if (!updated)
            return res.status(404).json({ message: "Không tìm thấy lớp" });
          res.json({
            message: "Upload danh sách email thành công",
            allowedEmails: updated.allowedEmails,
          });
        }
      );
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi upload danh sách", error: error.message });
    }
  }

  // rời lớp học
  async leaveClass(req, res) {
    try {
      const classId = req.params.id;
      const userId = req.user._id;

      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({ message: "Không tìm thấy lớp học" });
      }

      // Kiểm tra xem user có phải thành viên không
      if (!classData.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: "Bạn không phải thành viên lớp học này" });
      }

      // Xóa user khỏi tất cả nhóm thuộc lớp này
      await Group.updateMany({ classId }, { $pull: { members: userId } });

      // Xóa user khỏi lớp + lớp khỏi user
      classData.members = classData.members.filter(
        (member) => member.toString() !== userId.toString()
      );
      await classData.save();

      const user = await User.findById(userId);
      user.joinClass = user.joinClass.filter(
        (cid) => cid.toString() !== classId.toString()
      );
      await user.save();

      res.status(200).json({
        message: "Rời lớp học thành công, bạn cũng đã rời khỏi các nhóm!",
        class: classData,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi khi rời lớp học", error: error.message });
    }
  }

  // API: Lấy danh sách thành viên của 1 lớp (đã populate đầy đủ user)
  // GET /classes/:id/members
  async getClassMembers(req, res) {
    try {
      const { id } = req.params;
      const classData = await Class.findById(id).populate(
        "members",
        "username email role"
      );
      if (!classData) {
        return res.status(404).json({ message: "Không tìm thấy lớp học" });
      }
      // Trả về mảng members đã populate
      res.status(200).json(classData.members || []);
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách thành viên của lớp",
        error: error.message,
      });
    }
  }

  // API: Admin xóa 1 thành viên khỏi lớp
  // DELETE /classes/:id/members/:userId
  async removeMemberFromClass(req, res) {
    try {
      // Chỉ cho phép admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Chỉ admin mới có quyền xóa thành viên khỏi lớp!" });
      }
      const { id, userId } = req.params;
      const classData = await Class.findById(id);
      if (!classData) {
        return res.status(404).json({ message: "Không tìm thấy lớp học" });
      }

      // Không cho xóa admin
      const userToRemove = await User.findById(userId);
      if (!userToRemove) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      if (userToRemove.role === "admin") {
        return res
          .status(403)
          .json({ message: "Không thể xóa admin khỏi lớp" });
      }

      // Xóa khỏi thành viên lớp
      classData.members = classData.members.filter(
        (member) => member.toString() !== userId.toString()
      );
      await classData.save();

      // Xóa lớp khỏi joinClass của user
      userToRemove.joinClass = userToRemove.joinClass.filter(
        (cid) => cid.toString() !== id.toString()
      );
      await userToRemove.save();

      // Xóa user khỏi tất cả nhóm thuộc lớp này
      await Group.updateMany({ classId: id }, { $pull: { members: userId } });

      res.status(200).json({ message: "Đã xóa thành viên khỏi lớp!" });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi xóa thành viên khỏi lớp",
        error: error.message,
      });
    }
  }
}

export default new ClassesController();
