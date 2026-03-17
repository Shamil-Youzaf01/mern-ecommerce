import multer from "multer";

// NO MORE CloudinaryStorage!
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMultiple = upload.array("images", 5);
export const uploadAny = upload.any();
export default upload;
