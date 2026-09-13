import { prisma } from "../prisma/client.js";
import { Prisma } from "@prisma/client";

export const wishlistRepository = {
  checkExists: async (userId: string, itemId: string) => {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });
    return !!existing;
  },

  addWishlist: async (userId: string, itemId: string) => {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.wishlist.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
      });

      if (existing) {
        return existing;
      }

      const newWishlist = await tx.wishlist.create({
        data: {
          userId,
          itemId,
        },
      });

      await tx.item.update({
        where: { id: itemId },
        data: {
          wishlistCount: { increment: 1 },
        },
      });

      return newWishlist;
    });
  },

  removeWishlist: async (userId: string, itemId: string) => {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.wishlist.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
      });

      if (!existing) {
        return false;
      }

      await tx.wishlist.delete({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
      });

      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (item && item.wishlistCount > 0) {
        await tx.item.update({
          where: { id: itemId },
          data: {
            wishlistCount: { decrement: 1 },
          },
        });
      }

      return true;
    });
  },

  getWishlist: async (userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const where: Prisma.WishlistWhereInput = {
      userId,
      item: {
        status: "AVAILABLE",
        deletedAt: null,
      },
    };

    const [wishlist, total] = await prisma.$transaction([
      prisma.wishlist.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          item: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  profileImage: true,
                  averageRating: true,
                },
              },
              college: {
                select: {
                  id: true,
                  name: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              images: {
                where: { deletedAt: null },
                select: {
                  id: true,
                  imageUrl: true,
                  displayOrder: true,
                  isPrimary: true,
                },
                orderBy: {
                  displayOrder: "asc",
                },
              },
            },
          },
        },
      }),
      prisma.wishlist.count({ where }),
    ]);

    const items = wishlist.map((w) => w.item);

    return { items, total };
  },
};
