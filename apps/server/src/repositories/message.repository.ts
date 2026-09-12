import { prisma } from "../prisma/client.js";

export const messageRepository = {
  findManyByConversationIdWithPagination: async (conversationId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const where = {
      conversationId,
      deletedAt: null,
    };

    const [messages, total] = await prisma.$transaction([
      prisma.message.findMany({
        where,
        orderBy: {
          createdAt: "asc", // Prefer oldest -> newest as requested
        },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, username: true, profileImage: true },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    return { messages, total };
  },

  markMessagesAsRead: async (conversationId: string, userId: string) => {
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId, // Sender is not the current user
        },
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
      },
    });

    return result.count;
  },

  createMessageAndUpdateConversation: async (data: { conversationId: string, senderId: string, content: string }) => {
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          isRead: false,
        },
        include: {
          sender: {
            select: { id: true, name: true, username: true, profileImage: true },
          },
        },
      });

      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: new Date() },
      });

      return message;
    });
  },
};
