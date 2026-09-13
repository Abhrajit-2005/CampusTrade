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
};
