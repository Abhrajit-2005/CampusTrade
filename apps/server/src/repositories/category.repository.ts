import { prisma } from "../prisma/client.js";

export const categoryRepository = {
  findById: async (id: string) => {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  findAllActive: async () => {
    return prisma.category.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },
};
