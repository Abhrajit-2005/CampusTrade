import { itemImageRepository } from "../repositories/item-image.repository.js";
import { itemRepository } from "../repositories/item.repository.js";
import { AppError } from "../utils/AppError.js";
import { cloudinary } from "../middlewares/upload.middleware.js";

interface ReorderImageInput {
  id: string;
  displayOrder: number;
  isPrimary: boolean;
}

export const itemImageService = {
  uploadImages: async (
    userId: string,
    itemId: string,
    files: Express.Multer.File[]
  ) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt) {
      throw new AppError("Listing not found", 404, "NOT_FOUND");
    }

    if (item.sellerId !== userId) {
      throw new AppError("You do not have permission to modify this listing", 403, "FORBIDDEN");
    }

    if (item.status !== "DRAFT" && item.status !== "AVAILABLE") {
      throw new AppError(`Cannot modify images for listing in ${item.status} status`, 400, "BAD_REQUEST");
    }

    const existingImages = await itemImageRepository.findByItemId(itemId);
    
    if (existingImages.length + files.length > 5) {
      throw new AppError("Maximum of 5 images allowed per listing", 400, "BAD_REQUEST");
    }

    let nextDisplayOrder = existingImages.length > 0 
      ? Math.max(...existingImages.map(img => img.displayOrder)) + 1 
      : 0;

    let hasPrimary = existingImages.some(img => img.isPrimary);

    const imagesToCreate = files.map((file, index) => {
      const isPrimary = !hasPrimary && index === 0;
      return {
        publicId: file.filename, // cloudinary storage puts public_id in filename
        imageUrl: file.path,
        displayOrder: nextDisplayOrder + index,
        isPrimary,
        itemId,
      };
    });

    try {
      await itemImageRepository.createMany(imagesToCreate);
    } catch (error) {
      // If DB insert fails, cleanup Cloudinary
      for (const img of imagesToCreate) {
        await cloudinary.uploader.destroy(img.publicId).catch(console.error);
      }
      throw error;
    }

    return itemImageRepository.findByItemId(itemId);
  },

  deleteImage: async (userId: string, itemId: string, imageId: string) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt) {
      throw new AppError("Listing not found", 404, "NOT_FOUND");
    }

    if (item.sellerId !== userId) {
      throw new AppError("You do not have permission to modify this listing", 403, "FORBIDDEN");
    }

    if (item.status !== "DRAFT" && item.status !== "AVAILABLE") {
      throw new AppError(`Cannot modify images for listing in ${item.status} status`, 400, "BAD_REQUEST");
    }

    const image = await itemImageRepository.findById(imageId);
    if (!image || image.itemId !== itemId) {
      throw new AppError("Image not found", 404, "NOT_FOUND");
    }

    const allImages = await itemImageRepository.findByItemId(itemId);
    const remainingImages = allImages.filter(img => img.id !== imageId);

    // Delete from Cloudinary first
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      throw new AppError("Failed to delete image from storage", 500, "INTERNAL_SERVER_ERROR");
    }

    if (image.isPrimary && remainingImages.length > 0) {
      // Deterministically promote the lowest displayOrder
      const imageToPromote = remainingImages.reduce((prev, curr) => 
        prev.displayOrder < curr.displayOrder ? prev : curr
      );
      await itemImageRepository.hardDeleteAndPromoteTx(imageId, imageToPromote.id);
    } else {
      await itemImageRepository.hardDelete(imageId);
    }
  },

  reorderImages: async (userId: string, itemId: string, updates: ReorderImageInput[]) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt) {
      throw new AppError("Listing not found", 404, "NOT_FOUND");
    }

    if (item.sellerId !== userId) {
      throw new AppError("You do not have permission to modify this listing", 403, "FORBIDDEN");
    }

    if (item.status !== "DRAFT" && item.status !== "AVAILABLE") {
      throw new AppError(`Cannot modify images for listing in ${item.status} status`, 400, "BAD_REQUEST");
    }

    const existingImages = await itemImageRepository.findByItemId(itemId);
    if (existingImages.length === 0) {
      throw new AppError("Listing has no images", 400, "BAD_REQUEST");
    }

    if (updates.length !== existingImages.length) {
      throw new AppError("Must provide reorder updates for all existing images", 400, "BAD_REQUEST");
    }

    const updateIds = new Set(updates.map(u => u.id));
    const existingIds = new Set(existingImages.map(i => i.id));

    if (updateIds.size !== updates.length) {
      throw new AppError("Duplicate image IDs in reorder payload", 400, "BAD_REQUEST");
    }

    for (const id of updateIds) {
      if (!existingIds.has(id)) {
        throw new AppError(`Image ID ${id} does not belong to this listing`, 400, "BAD_REQUEST");
      }
    }

    const displayOrders = new Set(updates.map(u => u.displayOrder));
    if (displayOrders.size !== updates.length) {
      throw new AppError("Duplicate displayOrder values are not allowed", 400, "BAD_REQUEST");
    }

    const primaryCount = updates.filter(u => u.isPrimary).length;
    if (primaryCount !== 1) {
      throw new AppError("Exactly one image must be marked as primary", 400, "BAD_REQUEST");
    }

    await itemImageRepository.batchUpdateOrders(updates);
    
    return itemImageRepository.findByItemId(itemId);
  }
};
