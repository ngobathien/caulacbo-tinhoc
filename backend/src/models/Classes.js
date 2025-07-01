import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    nameClass: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    allowedEmails: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Class", classSchema);
