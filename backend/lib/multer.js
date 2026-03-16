import multer from "multer";
import cloudinary from "./cloudinary.js";

// multer-storage-cloudinary ESM compatibility fix
import * as multerCloudinary from "multer-storage-cloudinary";
const { CloudinaryStorage } = multerCloudinary;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMultiple = upload.array("images", 5);

export const uploadAny = upload.any();

export default upload;
