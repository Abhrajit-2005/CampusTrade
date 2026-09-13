import { wishlistRepository } from "../repositories/wishlist.repository.js";
import { itemRepository } from "../repositories/item.repository.js";
import { AppError } from "../utils/AppError.js";

export const wishlistService = {
  addWishlist: async (userId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt !== null) {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    }

    if (item.status !== "AVAILABLE") {
      throw new AppError("Only available items can be wishlisted", 400, "ITEM_UNAVAILABLE");
    }

    if (item.sellerId === userId) {
      throw new AppError("You cannot wishlist your own item", 403, "CANNOT_WISHLIST_OWN_ITEM");
    }

    return wishlistRepository.addWishlist(userId, itemId);
  },

  removeWishlist: async (userId: string, itemId: string) => {
    const success = await wishlistRepository.removeWishlist(userId, itemId);

    if (!success) {
      throw new AppError("Item is not in your wishlist", 404, "NOT_IN_WISHLIST");
    }

    return true;
  },

  checkWishlist: async (userId: string, itemId: string) => {
    const exists = await wishlistRepository.checkExists(userId, itemId);
    return { isWishlisted: exists };
  },

  getWishlist: async (userId: string, page: number, limit: number) => {
    const { items, total } = await wishlistRepository.getWishlist(userId, page, limit);

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
};
