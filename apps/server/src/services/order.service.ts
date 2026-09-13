import { orderRepository } from "../repositories/order.repository.js";
import { itemRepository } from "../repositories/item.repository.js";
import { AppError } from "../utils/AppError.js";

export const orderService = {
  createOrder: async (buyerId: string, itemId: string) => {
    const item = await itemRepository.findById(itemId);

    if (!item || item.deletedAt !== null) {
      throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
    }

    if (item.status !== "AVAILABLE") {
      throw new AppError("Item is no longer available", 409, "ITEM_NOT_AVAILABLE");
    }

    if (item.sellerId === buyerId) {
      throw new AppError("You cannot purchase your own listing", 403, "FORBIDDEN");
    }

    const order = await orderRepository.createOrderWithAtomicReservation(
      buyerId,
      item.sellerId,
      item.id,
      item.price,
      item.title
    );

    return order;
  },
};
