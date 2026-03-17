import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import CloudinaryStorage from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
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
