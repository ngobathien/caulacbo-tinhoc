import multer from "multer";

const uploadCsv = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Chấp nhận file .csv
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file .csv!"));
    }
  },
});

export default uploadCsv;
