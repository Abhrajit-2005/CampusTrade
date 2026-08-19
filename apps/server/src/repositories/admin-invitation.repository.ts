import { prisma } from "../prisma/client.js";

export const adminInvitationRepository = {
  findByTokenHash: async (tokenHash: string) => {
    return prisma.adminInvitation.findUnique({
      where: {
        tokenHash,
      },
      include: {
        college: true,
      },
    });
  },

  markAsAccepted: async (id: string) => {
    return prisma.adminInvitation.update({
      where: {
        id,
      },
      data: {
        acceptedAt: new Date(),
      },
    });
  },

  findPendingByEmailAndCollege: async (
    email: string,
    collegeId: string
  ) => {
    return prisma.adminInvitation.findFirst({
      where: {
        email,
        collegeId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  },
  deleteExpired: async () => {
    return prisma.adminInvitation.deleteMany({
      where: {
        acceptedAt: null,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  },
};