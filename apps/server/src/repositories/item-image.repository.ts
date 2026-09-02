import { prisma } from "../prisma/client.js";

export const itemImageRepository = {
  createMany: async (
    images: { publicId: string; imageUrl: string; displayOrder: number; isPrimary: boolean; itemId: string }[]
  ) => {
    return prisma.itemImage.createMany({
      data: images,
    });
  },

  findByItemId: async (itemId: string) => {
    return prisma.itemImage.findMany({
      where: { itemId, deletedAt: null },
      orderBy: { displayOrder: "asc" },
    });
  },

  findById: async (id: string) => {
    return prisma.itemImage.findUnique({
      where: { id },
    });
  },

  hardDelete: async (id: string) => {
    return prisma.itemImage.delete({
      where: { id },
    });
  },

  hardDeleteAndPromoteTx: async (
    imageIdToDelete: string,
    imageIdToPromote: string
  ) => {
    return prisma.$transaction([
      prisma.itemImage.delete({ where: { id: imageIdToDelete } }),
      prisma.itemImage.update({
        where: { id: imageIdToPromote },
        data: { isPrimary: true },
      }),
    ]);
  },

  batchUpdateOrders: async (updates: { id: string; displayOrder: number; isPrimary: boolean }[]) => {
    // Prisma does not support batch update with differing values in a single query easily, 
    // so we use a transaction of updates.
    const promises = updates.map((u) =>
      prisma.itemImage.update({
        where: { id: u.id },
        data: { displayOrder: u.displayOrder, isPrimary: u.isPrimary },
      })
    );
    return prisma.$transaction(promises);
  },
};
