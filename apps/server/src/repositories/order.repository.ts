import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";

export const orderRepository = {
  createOrderWithAtomicReservation: async (
    buyerId: string,
    sellerId: string,
    itemId: string,
    price: number,
    itemTitle: string
  ) => {
    return prisma.$transaction(async (tx) => {
      const result = await tx.item.updateMany({
        where: {
          id: itemId,
          status: "AVAILABLE",
          deletedAt: null,
        },
        data: {
          status: "RESERVED",
        },
      });

      if (result.count !== 1) {
        throw new AppError("Item is no longer available", 409, "ITEM_NOT_AVAILABLE");
      }

      return tx.order.create({
        data: {
          buyerId,
          sellerId,
          itemId,
          price,
          itemTitle,
          status: "PENDING",
        },
        include: {
          item: {
            include: {
              images: {
                where: { isPrimary: true, deletedAt: null },
              },
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              profileImage: true,
            }
          }
        },
      });
    });
  },

  findById: async (id: string) => {
    return prisma.order.findUnique({
      where: { id },
      include: { item: true },
    });
  },

  updateOrderStatus: async (
    orderId: string,
    itemId: string,
    newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED",
    expectedOrderStatus: "PENDING" | "CONFIRMED",
    expectedItemStatus?: "RESERVED",
    newItemStatus?: "AVAILABLE" | "SOLD"
  ) => {
    return prisma.$transaction(async (tx) => {
      // 1. Update Order atomically
      const orderResult = await tx.order.updateMany({
        where: { id: orderId, status: expectedOrderStatus },
        data: { status: newStatus },
      });

      if (orderResult.count !== 1) {
        throw new AppError(
          "Order status transition failed due to invalid current state",
          409,
          "INVALID_ORDER_STATUS"
        );
      }

      // 2. Update Item atomically if needed
      if (expectedItemStatus && newItemStatus) {
        const itemResult = await tx.item.updateMany({
          where: { id: itemId, status: expectedItemStatus },
          data: { status: newItemStatus },
        });

        if (itemResult.count !== 1) {
          throw new AppError(
            "Item status transition failed due to invalid current state",
            409,
            "INVALID_ITEM_STATUS"
          );
        }
      }

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          item: true,
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              profileImage: true,
            },
          },
        },
      });
    });
  },
};
