import mongoose from "mongoose";
import "dotenv/config";

async function connectDB() {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log("Connected success!"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
}
export default connectDB;
