import { prisma } from "../prisma/client.js";
import { Prisma, ItemStatus } from "@prisma/client";

export const itemRepository = {
  create: async (data: Prisma.ItemUncheckedCreateInput) => {
    return prisma.item.create({
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            averageRating: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  findManyWithPagination: async (
    page: number,
    limit: number,
    status: ItemStatus = "AVAILABLE",
    filters: any = {},
    sortBy: string = "createdAt",
    sortOrder: string = "desc"
  ) => {
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      status,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    const orderBy: Prisma.ItemOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await prisma.$transaction([
      prisma.item.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              profileImage: true,
              averageRating: true,
            },
          },
          college: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            where: { deletedAt: null },
            select: {
              id: true,
              imageUrl: true,
              displayOrder: true,
              isPrimary: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      }),
      prisma.item.count({
        where,
      }),
    ]);

    return { items, total };
  },

  findMyListings: async (userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.item.findMany({
        where: {
          sellerId: userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            where: { deletedAt: null },
            select: {
              id: true,
              imageUrl: true,
              displayOrder: true,
              isPrimary: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      }),
      prisma.item.count({
        where: {
          sellerId: userId,
          deletedAt: null,
        },
      }),
    ]);

    return { items, total };
  },

  findById: async (id: string) => {
    return prisma.item.findUnique({
      where: { id },
    });
  },

  updateStatus: async (id: string, status: ItemStatus) => {
    return prisma.item.update({
      where: { id },
      data: { status },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            averageRating: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  findByIdWithDetails: async (id: string) => {
    return prisma.item.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImage: true,
            averageRating: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
            displayOrder: true,
            isPrimary: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });
  },

  incrementViews: async (id: string) => {
    return prisma.item.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: { id: true },
    });
  },

  update: async (id: string, data: Prisma.ItemUpdateInput) => {
    return prisma.item.update({
      where: { id },
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImage: true,
            averageRating: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
            displayOrder: true,
            isPrimary: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });
  },

  softDelete: async (id: string) => {
    return prisma.item.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  },
};
