// fileRead.js
import multer from "multer";

const storage = multer.memoryStorage(); // Store files in memory for text processing

const fileFilter = (req, file, cb) => {
  // Accept all text-based files by checking MIME type prefix
  if (file.mimetype.startsWith("text/")) {
    cb(null, true);
  } else {
    cb(new Error("Only text files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Return the middleware function
export default upload.array("files"); // Default to handling multiple files
