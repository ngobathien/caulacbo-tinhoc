import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/email.js"; // Đảm bảo import chính xác

class AuthController {
  // Tạo token
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  // Đăng ký người dùng mới
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Thiếu thông tin!" });
      }

      // kiểm tra 
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        isVerified: false,
        isApproved: false, // Đăng ký xong phải chờ admin duyệt!
      });
      await newUser.save();

      // Gửi email xác thực, chưa _id của user đó (nếu cần)
      const verificationToken = this.generateToken(newUser._id);
      await sendVerificationEmail(newUser.email, verificationToken);

      res.status(201).json({
        message:
          "Đăng ký thành công! Hãy kiểm tra email để xác thực, sau đó chờ admin duyệt tài khoản.",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Đăng ký không thành công, lỗi khi đăng ký!" });
    }
  }

  // Đăng nhập người dùng
  async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          message:
            "Tài khoản chưa xác thực email. Vui lòng kiểm tra email để xác thực.",
        });
      }

      if (!user.isApproved) {
        return res.status(403).json({
          message:
            "Tài khoản của bạn chưa được admin duyệt. Vui lòng chờ admin duyệt tài khoản.",
        });
      }

      res.status(200).json({
        message: "Đăng nhập thành công!",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          token: this.generateToken(user._id),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi, vui lòng thử lại sau!" });
    }
  }

  //Xác thực tài khoản qua token
  async verifyAccount(req, res) {
    const { token } = req.params;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(400).send(`
        <html>
          <body style="font-family:sans-serif;">
            <h2 style="color:#e74c3c;">Xác thực thất bại!</h2>
            <p>Người dùng không tồn tại.</p>
          </body>
        </html>
      `);
      }

      if (user.isVerified) {
        return res.status(200).send(`
        <html>
          <body style="font-family:sans-serif;">
            <h2 style="color:#2ecc71;">Tài khoản đã xác thực!</h2>
            <p>Tài khoản của bạn đã được xác thực trước đó. Bạn có thể <a href="http://localhost:5173/login">đăng nhập tại đây</a>.</p>
          </body>
        </html>
      `);
      }
      user.isVerified = true;
      user.verifyToken = null;
      await user.save();
      // Thông báo xác thực thành công
      return res.status(200).send(`
      <html>
        <body style="font-family:sans-serif;">
          <h2 style="color:#2ecc71;">Xác thực thành công!</h2>
          <p>Tài khoản của bạn đã được xác thực. Bạn có thể <a href="http://localhost:5173/login">đăng nhập ngay tại đây</a>.</p>
        </body>
      </html>
    `);
    } catch (error) {
      console.error(error);
      return res.status(500).send(`
      <html>
        <body style="font-family:sans-serif;">
          <h2 style="color:#e74c3c;">Xác thực thất bại!</h2>
          <p>Liên kết xác thực không hợp lệ hoặc đã hết hạn.</p>
        </body>
      </html>
    `);
    }
  }

  // Xác thực tài khoản qua token
  // async verifyAccount(req, res) {
  //   const { token } = req.params; // Nhận token từ params URL

  //   try {
  //     // Giải mã token để lấy user ID
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //     // Tìm user theo ID và xác thực
  //     const user = await User.findById(decoded.id);
  //     if (!user) {
  //       return res.status(400).json({ message: "Người dùng không tồn tại!" });
  //     }

  //     // Kiểm tra nếu tài khoản đã xác thực rồi
  //     if (user.isVerified) {
  //       return res
  //         .status(200)
  //         .json({ message: "Tài khoản đã được xác thực trước đó!" });
  //     }

  //     // Cập nhật trạng thái isVerified
  //     user.isVerified = true;
  //     user.verifyToken = null; // Xóa token xác thực sau khi đã xác nhận thành công
  //     await user.save();
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: "Lỗi khi xác thực tài khoản!" });
  //   }
  // }
  // Xác thực tài khoản qua token
}

export default new AuthController();
