import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { itemImageService } from "../services/item-image.service.js";
import { sendSuccess } from "../utils/response.js";
import { cloudinary } from "../middlewares/upload.middleware.js";

export const uploadImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }

    try {
      const images = await itemImageService.uploadImages(req.user!.sub, req.params.id as string, files);
      
      // Map to safe response format (exclude publicId)
      const safeImages = images.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary
      }));

      return sendSuccess(res, safeImages, "Images uploaded successfully", 201);
    } catch (serviceError) {
      // If service throws (e.g., unauthorized, max limit reached), delete from Cloudinary
      for (const file of files) {
        if (file.filename) {
          await cloudinary.uploader.destroy(file.filename).catch(console.error);
        }
      }
      throw serviceError; // re-throw to be handled by errorMiddleware
    }
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await itemImageService.deleteImage(
      req.user!.sub,
      req.params.id as string,
      req.params.imageId as string
    );

    return sendSuccess(res, null, "Image deleted successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const reorderImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const images = await itemImageService.reorderImages(
      req.user!.sub,
      req.params.id as string,
      req.body
    );

    const safeImages = images.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      displayOrder: img.displayOrder,
      isPrimary: img.isPrimary
    }));

    return sendSuccess(res, safeImages, "Images reordered successfully", 200);
  } catch (error) {
    next(error);
  }
};
