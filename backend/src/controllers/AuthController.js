import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/email.js"; // Import chính xác

class AuthController {
  // 🔹 Tạo token xác thực email
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  }

  // 🔹 Đăng ký người dùng mới
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
        isApproved: false, // Đăng ký xong phải chờ admin duyệt
      });

      await newUser.save();

      // 🔹 Tạo token xác thực và gửi email
      const verificationToken = this.generateToken(newUser._id);

      try {
        await sendVerificationEmail(newUser.email, verificationToken);
      } catch (emailError) {
        console.error("❌ Lỗi khi gửi email:", emailError);
        // Không throw lỗi nữa, mà phản hồi nhẹ để tránh lỗi headers sent
        return res.status(201).json({
          message:
            "Đăng ký thành công, nhưng gửi email xác thực thất bại. Vui lòng thử lại sau.",
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
          },
        });
      }

      // 🔹 Nếu gửi mail ok
      return res.status(201).json({
        message:
          "Đăng ký thành công! Hãy kiểm tra email để xác thực, sau đó chờ admin duyệt tài khoản.",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("🔥 Lỗi đăng ký:", error);
      return res.status(500).json({
        message: "Đăng ký không thành công, lỗi khi đăng ký!",
      });
    }
  }

  // 🔹 Đăng nhập người dùng
  async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          message: "Tài khoản chưa xác thực email. Vui lòng kiểm tra email để xác thực.",
        });
      }

      if (!user.isApproved) {
        return res.status(403).json({
          message: "Tài khoản của bạn chưa được admin duyệt. Vui lòng chờ admin duyệt tài khoản.",
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
      console.error("🔥 Lỗi đăng nhập:", error);
      res.status(500).json({ message: "Đã xảy ra lỗi, vui lòng thử lại sau!" });
    }
  }

  // 🔹 Xác thực tài khoản qua token
  async verifyAccount(req, res) {
    const { token } = req.params;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(400).send(`
          <html><body><h2 style="color:#e74c3c;">Xác thực thất bại!</h2>
          <p>Người dùng không tồn tại.</p></body></html>
        `);
      }

      if (user.isVerified) {
        return res.status(200).send(`
          <html><body><h2 style="color:#2ecc71;">Tài khoản đã xác thực!</h2>
          <p>Bạn có thể <a href="http://localhost:5173/login">đăng nhập tại đây</a>.</p></body></html>
        `);
      }

      user.isVerified = true;
      user.verifyToken = null;
      await user.save();

      return res.status(200).send(`
        <html><body><h2 style="color:#2ecc71;">Xác thực thành công!</h2>
        <p>Bạn có thể <a href="http://localhost:5173/login">đăng nhập ngay</a>.</p></body></html>
      `);
    } catch (error) {
      console.error("❌ verifyAccount error:", error);
      return res.status(500).send(`
        <html><body><h2 style="color:#e74c3c;">Xác thực thất bại!</h2>
        <p>Liên kết xác thực không hợp lệ hoặc đã hết hạn.</p></body></html>
      `);
    }
  }
}

export default new AuthController();
