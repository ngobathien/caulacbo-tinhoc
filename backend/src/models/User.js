import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "teacher"],
      default: "user",
    },
    joinClass: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    joinGroup: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    avatar: { type: String, default: null },
    birthday: { type: Date, default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    hometown: { type: String, default: null },
    // xác thực email
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String, default: null },
    // duyệt bởi admin
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
