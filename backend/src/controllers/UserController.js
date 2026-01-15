import supabase from "../config/supabase.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
const bucket_name_avatars = process.env.BUCKET_NAME_ASSIGNMENTS;

class UserController {
  // Lấy danh sách tất cả người dùng (chỉ admin)
  async getUsers(req, res) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Không thể lấy danh sách người dùng." });
    }
  }

  // Lấy thông tin người dùng theo ID (chỉ admin)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Không thể lấy thông tin người dùng." });
    }
  }

  // Tạo người dùng mới (chỉ admin)
  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Chỉ admin mới được phép
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Chỉ admin mới được phép tạo người dùng." });
      }

      // Kiểm tra thông tin đầu vào
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Thiếu thông tin!" });
      }

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng!" });
      }

      // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
      const saltRounds = 10; // Số vòng mã hóa
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Tạo người dùng mới với mật khẩu đã mã hóa
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || "user",
      });

      const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      };
      res
        .status(201)
        .json({ message: "Người dùng đã được tạo.", user: userResponse });
    } catch (error) {
      res.status(500).json({ message: "Không thể tạo người dùng." });
      console.error("Lỗi khi tạo người dùng:", error);
    }
  }

  // Cập nhật thông tin người dùng (chỉ admin hoặc chính chủ)
  // Trong hàm updateUser:
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        username,
        email,
        password,
        role,
        birthday,
        phone,
        address,
        hometown,
      } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }

      if (req.user.role !== "admin" && req.user.id !== user.id.toString()) {
        return res
          .status(403)
          .json({ message: "Không được phép chỉnh sửa thông tin này." });
      }

      let hashedPassword = user.password;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      user.username = username || user.username;
      user.email = email || user.email;
      user.password = hashedPassword;
      user.role = req.user.role === "admin" ? role || user.role : user.role;
      user.birthday = birthday !== undefined ? birthday : user.birthday;
      user.phone = phone !== undefined ? phone : user.phone;
      user.address = address !== undefined ? address : user.address;
      user.hometown = hometown !== undefined ? hometown : user.hometown;

      // =========================supbase===============================
      // Kiểm tra có file được gửi lên không
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const filePath = `uploads/avatars/${req.user._id}/${req.file.originalname}`;
      console.log(filePath);

      // Upload avatar lên supabase
      const { data, error } = await supabase.storage
        .from(bucket_name_avatars)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      // Lấy link lưu vào database
      const { data: publicUrlData } = await supabase.storage
        .from(bucket_name_avatars)
        .getPublicUrl(filePath);

      // path lưu vào database
      const fileUrl = publicUrlData.publicUrl;
      const storagePath = filePath;
      console.log(fileUrl);

      // ========================================================

      // XỬ LÝ AVATAR
      if (req.file) {
        user.avatar = fileUrl;
      }
      // if (req.file) {
      //   user.avatar = `/avatars/${user._id}-${user.email}/${req.file.filename}`;
      // }

      const updatedUser = await user.save();

      res.json({
        message: "Cập nhật thành công.",
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          birthday: updatedUser.birthday,
          phone: updatedUser.phone,
          address: updatedUser.address,
          hometown: updatedUser.hometown,
          avatar: updatedUser.avatar,
        },
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      res.status(500).json({ message: "Không thể cập nhật người dùng." });
    }
  }

  // Xóa người dùng (chỉ admin)
  async deleteUser(req, res) {
    try {
      const { id } = req.params; // Sửa `_id` thành `id`

      // Kiểm tra nếu user đã đăng nhập
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Bạn cần đăng nhập để thực hiện thao tác này!" });
      }

      // Chỉ admin mới được phép xóa
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Chỉ admin mới được phép xóa người dùng." });
      }

      // Kiểm tra người dùng có tồn tại hay không
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }

      // Xóa user bằng `findByIdAndDelete()` thay vì `.remove()`
      await User.findByIdAndDelete(id);
      res.json({ message: "Người dùng đã được xóa thành công." });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Không thể xóa người dùng.", error: error.message });
    }
  }

  // lấy dữ liệu cá nhân để cập nhật
  // Không cần lấy từ req.params nữa
  async getProfile(req, res) {
    try {
      // const { id } = req.params._id;
      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        birthday: user.birthday,
        phone: user.phone,
        address: user.address,
        spouses: user.spouses,
        hometown: user.hometown,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Lỗi khi lấy hồ sơ:", error);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  }

  // Admin duyệt tài khoản user
  async approveUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }
      user.isApproved = true;
      await user.save();
      res.json({ message: "Duyệt tài khoản thành công.", user });
    } catch (error) {
      res.status(500).json({ message: "Không thể duyệt tài khoản." });
    }
  }
}

export default new UserController();
