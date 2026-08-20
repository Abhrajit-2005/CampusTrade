import { prisma } from "../prisma/client.js";

export const collegeRepository = {
  findByDomain: async (domain: string) => {
    return prisma.college.findUnique({
      where: { domain },
    });
  },
  findById: async (id: string) => {
    return prisma.college.findUnique({
      where: {
        id,
      },
    });
  },
  create: async (data: {
    name: string;
    domain: string;
    city: string;
    state: string;
    country: string;
  }) => {
    return prisma.college.create({
      data,
    });
  },
  createAdminInvitation: async (data: {
    name: string;
    email: string;
    tokenHash: string;
    collegeId: string;
    expiresAt: Date;
  }) => {
    return prisma.adminInvitation.create({
      data,
    });
  },
};