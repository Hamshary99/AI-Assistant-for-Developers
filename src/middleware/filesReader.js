// fileRead.js
import multer from "multer";

const storage = multer.memoryStorage(); 

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
  limits: { fileSize: 5 * 1024 * 1024 }, 
});


export default upload.any(); 
