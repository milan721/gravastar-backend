const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    const fname = `pdf-${Date.now()}-${file.originalname}`;
    callback(null, fname);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === "application/pdf") {
    callback(null, true);
  } else {
    callback(new Error("Only PDF files are allowed"), false);
  }
};

const multerConfig = multer({
  storage,
  fileFilter,
});

module.exports = multerConfig;
