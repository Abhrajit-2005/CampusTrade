import { Router } from "express";
import { uploadImages, deleteImage, reorderImages } from "../controllers/item-image.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { upload, cloudinary } from "../middlewares/upload.middleware.js";
import { reorderImagesSchema } from "../validators/item-image.validator.js";

const router = Router({ mergeParams: true });

// Error handling wrapper for Multer to catch file size/type errors and clean up Cloudinary orphans
const uploadMiddleware = (req: any, res: any, next: any) => {
  const uploadArray = upload.array("images", 5);
  uploadArray(req, res, async (err) => {
    if (err) {
      // If Multer failed (e.g., >5 files, wrong type), but some valid ones got uploaded to Cloudinary,
      // req.files will contain the successfully uploaded files so far. We must delete them.
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          if (file.filename) {
            await cloudinary.uploader.destroy(file.filename).catch(console.error);
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }
    next();
  });
};

router.post("/", authenticate, uploadMiddleware, uploadImages);

router.delete("/:imageId", authenticate, deleteImage);

router.patch("/reorder", authenticate, validate(reorderImagesSchema), reorderImages);

export default router;
