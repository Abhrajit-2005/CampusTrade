import { prisma } from "../prisma/client.js";

export const refreshSessionRepository = {
  create: async (data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }) => {
    return prisma.refreshSession.create({
      data,
    });
  },

  findByTokenHash: async (tokenHash: string) => {
    return prisma.refreshSession.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });
  },

  revoke: async (id: string) => {
    return prisma.refreshSession.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  revokeAllForUser: async (userId: string) => {
    return prisma.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },
};