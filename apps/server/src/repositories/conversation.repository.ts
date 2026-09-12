import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";

export const conversationRepository = {
  findByItemAndBuyer: async (itemId: string, buyerId: string) => {
    return prisma.conversation.findUnique({
      where: {
        itemId_buyerId: {
          itemId,
          buyerId,
        },
      },
      include: {
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true } },
        item: { select: { id: true, title: true, price: true, status: true, images: { where: { isPrimary: true, deletedAt: null }, select: { imageUrl: true } } } }
      }
    });
  },

  findById: async (id: string) => {
    return prisma.conversation.findUnique({
      where: { id },
    });
  },

  create: async (data: Prisma.ConversationUncheckedCreateInput) => {
    try {
      return await prisma.conversation.create({
        data,
        include: {
          buyer: { select: { id: true, name: true, profileImage: true } },
          seller: { select: { id: true, name: true, profileImage: true } },
          item: { select: { id: true, title: true, price: true, status: true, images: { where: { isPrimary: true, deletedAt: null }, select: { imageUrl: true } } } }
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        // Unique constraint failed, return existing
        return prisma.conversation.findUniqueOrThrow({
          where: {
            itemId_buyerId: {
              itemId: data.itemId,
              buyerId: data.buyerId,
            },
          },
          include: {
            buyer: { select: { id: true, name: true, profileImage: true } },
            seller: { select: { id: true, name: true, profileImage: true } },
            item: { select: { id: true, title: true, price: true, status: true, images: { where: { isPrimary: true, deletedAt: null }, select: { imageUrl: true } } } }
          }
        });
      }
      throw error;
    }
  },

  findManyByUserIdWithPagination: async (userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const where: Prisma.ConversationWhereInput = {
      OR: [
        { buyerId: userId },
        { sellerId: userId }
      ],
      deletedAt: null,
    };

    const [conversations, total] = await prisma.$transaction([
      prisma.conversation.findMany({
        where,
        orderBy: {
          lastMessageAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          buyer: {
            select: { id: true, name: true, profileImage: true },
          },
          seller: {
            select: { id: true, name: true, profileImage: true },
          },
          item: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              images: {
                where: { isPrimary: true, deletedAt: null },
                select: { imageUrl: true },
              },
            },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    return { conversations, total };
  },
};
