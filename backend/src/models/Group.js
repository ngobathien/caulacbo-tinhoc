import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    nameGroup: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Group", groupSchema);
