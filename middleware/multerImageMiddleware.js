const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    const fname = `img-${Date.now()}-${file.originalname}`;
    callback(null, fname);
  },
});

const fileFilter = (req, file, callback) => {
  // image types
  const ok = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
  ].includes(file.mimetype);
  if (ok) {
    callback(null, true);
  } else {
    callback(new Error("Only image files are allowed"), false);
  }
};

const multerImageConfig = multer({
  storage,
  fileFilter,
});

module.exports = multerImageConfig;
