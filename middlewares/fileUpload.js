const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/uploads/'); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname), // image-1234567890-1234567890.jpg
    ); // Unique filename with original extension
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400), false);
  }
};

// Initialize multer with the configured options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { filesize: 2 * 1024 * 1024 }, // Limit file size to 2MB
});

module.exports = upload;
