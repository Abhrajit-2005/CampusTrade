import { itemRepository } from "../repositories/item.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";
import { ItemCondition } from "@prisma/client";

interface CreateItemInput {
  title: string;
  description: string;
  price: number;
  isNegotiable?: boolean;
  condition: ItemCondition;
  pickupLocation: string;
  categoryId: string;
}

interface UpdateItemInput {
  title?: string;
  description?: string;
  price?: number;
  isNegotiable?: boolean;
  condition?: ItemCondition;
  pickupLocation?: string;
  categoryId?: string;
}

export interface GetItemsFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
}

export const itemService = {
  createItem: async (userId: string, data: CreateItemInput) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (!user.collegeId) {
      throw new AppError(
        "User must belong to a college to create an item",
        403,
        "FORBIDDEN"
      );
    }

    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    const item = await itemRepository.create({
      title: data.title,
      description: data.description,
      price: data.price,
      isNegotiable: data.isNegotiable ?? false,
      condition: data.condition,
      pickupLocation: data.pickupLocation,
      categoryId: data.categoryId,
      sellerId: user.id,
      collegeId: user.collegeId,
      status: "DRAFT",
    });

    return item;
  },

  getItems: async (
    page: number, 
    limit: number, 
    filters: GetItemsFilters = {}, 
    sortBy: string = "createdAt", 
    sortOrder: string = "desc"
  ) => {
    const { items, total } = await itemRepository.findManyWithPagination(
      page,
      limit,
      "AVAILABLE",
      filters,
      sortBy,
      sortOrder
    );

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  },

  getMyListings: async (userId: string, page: number, limit: number) => {
    const { items, total } = await itemRepository.findMyListings(
      userId,
      page,
      limit
    );

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  },

  publishItem: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt) {
      throw new AppError("Listing not found", 404, "NOT_FOUND");
    }

    if (item.sellerId !== userId) {
      throw new AppError(
        "You do not have permission to publish this listing",
        403,
        "FORBIDDEN"
      );
    }

    if (item.status !== "DRAFT") {
      throw new AppError(
        `Cannot publish listing with status ${item.status}. Only DRAFT listings can be published.`,
        400,
        "BAD_REQUEST"
      );
    }

    return itemRepository.updateStatus(itemId, "AVAILABLE");
  },

  getItemById: async (itemId: string, requesterUserId: string) => {
    const item = await itemRepository.findByIdWithDetails(itemId);

    if (!item) {
      throw new AppError("Listing not found or is unavailable", 404, "NOT_FOUND");
    }

    if (item.status !== "AVAILABLE" && item.sellerId !== requesterUserId) {
      throw new AppError("Listing not found or is unavailable", 404, "NOT_FOUND");
    }

    if (item.sellerId !== requesterUserId) {
      itemRepository.incrementViews(itemId).catch((err) => {
        console.error(`Failed to increment views for item ${itemId}:`, err);
      });

      item.views += 1;
    }

    return item;
  },

  updateItem: async (userId: string, itemId: string, data: UpdateItemInput) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt) {
      throw new AppError("Listing not found", 404, "NOT_FOUND");
    }

    if (item.sellerId !== userId) {
      throw new AppError(
        "You do not have permission to update this listing",
        403,
        "FORBIDDEN"
      );
    }

    if (item.status !== "DRAFT" && item.status !== "AVAILABLE") {
      throw new AppError(
        `Cannot update listing with status ${item.status}. Only DRAFT and AVAILABLE listings can be updated.`,
        400,
        "BAD_REQUEST"
      );
    }

    if (data.categoryId && data.categoryId !== item.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
      }
    }

    return itemRepository.update(itemId, data);
  },

  deleteItem: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt) {
      throw new AppError("Listing not found", 404, "NOT_FOUND");
    }

    if (item.sellerId !== userId) {
      throw new AppError(
        "You do not have permission to delete this listing",
        403,
        "FORBIDDEN"
      );
    }

    if (item.status !== "DRAFT" && item.status !== "AVAILABLE") {
      throw new AppError(
        `Cannot delete listing with status ${item.status}. Only DRAFT and AVAILABLE listings can be deleted.`,
        400,
        "BAD_REQUEST"
      );
    }

    await itemRepository.softDelete(itemId);
  },
};
