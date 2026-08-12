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
};