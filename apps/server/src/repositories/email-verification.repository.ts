import { prisma } from "../prisma/client";

export const emailVerificationRepository = {
  create: async (data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }) => {
    return prisma.emailVerificationToken.create({
      data,
    });
  },

  findByTokenHash: async (tokenHash: string) => {
    return prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });
  },

  markAsUsed: async (id: string) => {
    return prisma.emailVerificationToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  },
};