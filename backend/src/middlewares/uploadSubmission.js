import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { assignmentId, nameClass, nameGroup } = req.body;
    const dir = path.join(
      "uploads",
      "assignments",
      `${assignmentId}-${nameClass}-${nameGroup}`
    );
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const uploadSubmission = multer({ storage });

export default uploadSubmission;
