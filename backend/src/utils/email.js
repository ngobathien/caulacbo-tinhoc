import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Hoặc dịch vụ email bạn sử dụng
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Sử dụng TLS (true nếu dùng port 465)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Hỗ trợ Câu Lạc Bộ" <${process.env.EMAIL_USER}>`, // Hiển thị tên chuyên nghiệp hơn
    to: email,
    subject: "Xác thực tài khoản của bạn",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Xác nhận tài khoản của bạn</h2>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng xác nhận email bằng cách nhấp vào liên kết dưới đây:</p>
        <a href="${process.env.BASE_URL}/api/v1/auth/verify/${token}" 
          style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Xác thực tài khoản
        </a>
        <p>Sau khi xác thực, bạn sẽ được chuyển đến trang đăng nhập.</p>
        <hr style="margin-top: 20px;">
        <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ hỗ trợ Câu Lạc Bộ</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw new Error("Không thể gửi email xác thực!");
  }
};
