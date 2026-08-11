import { prisma } from "../prisma/client.js";

export const collegeRepository = {
  findByDomain: async (domain: string) => {
    return prisma.college.findUnique({
      where: { domain },
    });
  },
};