import { prisma } from "../prisma/client.js";
import { Prisma } from "@prisma/client";

export const adminRepository = {
  getAggregateStats: async (filters: {
    collegeId?: string;
  } = {}) => {
    
    // Scoping conditions
    const userWhere: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(filters.collegeId ? { collegeId: filters.collegeId } : {})
    };

    const itemWhere: Prisma.ItemWhereInput = {
      deletedAt: null,
      ...(filters.collegeId ? { collegeId: filters.collegeId } : {})
    };

    const orderWhere: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(filters.collegeId ? { item: { collegeId: filters.collegeId } } : {})
    };

    const paymentWhere: Prisma.PaymentWhereInput = {
      ...(filters.collegeId ? { order: { item: { collegeId: filters.collegeId } } } : {})
    };

    // Parallel aggregate queries
    const [
      // Colleges (Only platform admin needs this, but we'll fetch it safely)
      totalColleges,
      activeColleges,

      // Users
      totalUsers,
      activeUsers,
      pendingUsers,

      // Items
      totalItems,
      availableItems,
      reservedItems,
      soldItems,
      removedItems,

      // Orders
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,

      // Payments
      successfulPaymentAgg,
      successfulPaymentCount,
    ] = await Promise.all([
      // Colleges (Ignore soft-deletes where applicable)
      filters.collegeId 
        ? Promise.resolve(0) 
        : prisma.college.count({ where: { deletedAt: null } }),
      filters.collegeId 
        ? Promise.resolve(0) 
        : prisma.college.count({ where: { deletedAt: null, isVerified: true } }),

      // Users
      prisma.user.count({ where: userWhere }),
      prisma.user.count({ where: { ...userWhere, status: "ACTIVE" } }),
      prisma.user.count({ 
        where: { 
          ...userWhere, 
          status: { in: ["PENDING_VERIFICATION", "PENDING_COLLEGE_APPROVAL"] } 
        } 
      }),

      // Items
      prisma.item.count({ where: itemWhere }),
      prisma.item.count({ where: { ...itemWhere, status: "AVAILABLE" } }),
      prisma.item.count({ where: { ...itemWhere, status: "RESERVED" } }),
      prisma.item.count({ where: { ...itemWhere, status: "SOLD" } }),
      prisma.item.count({ where: { ...itemWhere, status: "REMOVED" } }),

      // Orders
      prisma.order.count({ where: orderWhere }),
      prisma.order.count({ where: { ...orderWhere, status: "PENDING" } }),
      prisma.order.count({ where: { ...orderWhere, status: "CONFIRMED" } }),
      prisma.order.count({ where: { ...orderWhere, status: "COMPLETED" } }),
      prisma.order.count({ where: { ...orderWhere, status: "CANCELLED" } }),

      // Payments
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: { ...paymentWhere, status: "SUCCESS" },
      }),
    ]);

    return {
      colleges: filters.collegeId ? undefined : {
        total: totalColleges,
        active: activeColleges,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
      },
      listings: {
        total: totalItems,
        available: availableItems,
        reserved: reservedItems,
        sold: soldItems,
        removed: removedItems,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      payments: {
        successfulCount: successfulPaymentCount,
        successfulAmount: successfulPaymentAgg._sum.amount || 0,
        currency: "INR", // Based on the platform's default setup
      },
    };
  },

  getUsersWithPagination: async (
    page: number,
    limit: number,
    filters: {
      collegeId?: string;
      search?: string;
      status?: string;
    }
  ) => {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(filters.collegeId ? { collegeId: filters.collegeId } : {}),
      ...(filters.status ? { status: filters.status as any } : {}),
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { username: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          college: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  getUserDetails: async (targetId: string, collegeId?: string) => {
    return prisma.user.findFirst({
      where: {
        id: targetId,
        deletedAt: null,
        ...(collegeId ? { collegeId } : {}),
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        college: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  updateUserStatus: async (
    targetId: string,
    newStatus: "ACTIVE" | "SUSPENDED",
    currentStatus: "ACTIVE" | "SUSPENDED",
    adminRole: string,
    adminId: string,
    adminCollegeId?: string
  ) => {
    return prisma.user.updateMany({
      where: {
        id: targetId,
        NOT: { id: adminId },
        status: currentStatus as any,
        deletedAt: null,
        ...(adminRole === "COLLEGE_ADMIN"
          ? { role: { notIn: ["PLATFORM_ADMIN", "COLLEGE_ADMIN"] } }
          : { role: { not: "PLATFORM_ADMIN" } }),
        ...(adminCollegeId ? { collegeId: adminCollegeId } : {}),
      },
      data: {
        status: newStatus as any,
      },
    });
  },

  getItemsWithPagination: async (
    page: number,
    limit: number,
    filters: {
      collegeId?: string;
      search?: string;
      status?: string;
      categoryId?: string;
      condition?: string;
    }
  ) => {
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      deletedAt: null,
      ...(filters.collegeId ? { collegeId: filters.collegeId } : {}),
      ...(filters.status ? { status: filters.status as any } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.condition ? { condition: filters.condition as any } : {}),
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          isNegotiable: true,
          condition: true,
          status: true,
          pickupLocation: true,
          views: true,
          wishlistCount: true,
          createdAt: true,
          updatedAt: true,
          seller: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
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
            },
          },
          images: {
            where: { deletedAt: null },
            select: {
              id: true,
              imageUrl: true,
              isPrimary: true,
            },
            orderBy: { displayOrder: "asc" },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    return { items, total };
  },

  getItemDetails: async (targetId: string, collegeId?: string) => {
    return prisma.item.findFirst({
      where: {
        id: targetId,
        deletedAt: null,
        ...(collegeId ? { collegeId } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        isNegotiable: true,
        condition: true,
        status: true,
        pickupLocation: true,
        views: true,
        wishlistCount: true,
        createdAt: true,
        updatedAt: true,
        seller: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
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
          },
        },
        images: {
          where: { deletedAt: null },
          select: {
            id: true,
            imageUrl: true,
            isPrimary: true,
            displayOrder: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  },

  updateItemStatus: async (
    targetId: string,
    newStatus: string,
    currentStatuses: string[],
    adminCollegeId?: string
  ) => {
    return prisma.item.updateMany({
      where: {
        id: targetId,
        deletedAt: null,
        status: { in: currentStatuses as any[] },
        ...(adminCollegeId ? { collegeId: adminCollegeId } : {}),
      },
      data: {
        status: newStatus as any,
      },
    });
  },

  getOrdersWithPagination: async (
    page: number,
    limit: number,
    filters: {
      collegeId?: string;
      search?: string;
      status?: string;
    }
  ) => {
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(filters.collegeId ? { item: { collegeId: filters.collegeId } } : {}),
      ...(filters.status ? { status: filters.status as any } : {}),
    };

    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: "insensitive" } },
        { itemTitle: { contains: filters.search, mode: "insensitive" } },
        { buyer: { name: { contains: filters.search, mode: "insensitive" } } },
        { buyer: { username: { contains: filters.search, mode: "insensitive" } } },
        { buyer: { email: { contains: filters.search, mode: "insensitive" } } },
        { seller: { name: { contains: filters.search, mode: "insensitive" } } },
        { seller: { username: { contains: filters.search, mode: "insensitive" } } },
        { seller: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const selectQuery = {
      id: true,
      price: true,
      itemTitle: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      item: {
        select: {
          id: true,
          title: true,
          status: true,
          college: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
      seller: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: selectQuery,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  },

  getOrderDetails: async (targetId: string, collegeId?: string) => {
    return prisma.order.findFirst({
      where: {
        id: targetId,
        deletedAt: null,
        ...(collegeId ? { item: { collegeId } } : {}),
      },
      select: {
        id: true,
        price: true,
        itemTitle: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        item: {
          select: {
            id: true,
            title: true,
            status: true,
            college: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  getPaymentsWithPagination: async (
    page: number,
    limit: number,
    filters: {
      collegeId?: string;
      search?: string;
      status?: string;
      provider?: string;
    }
  ) => {
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      order: {
        deletedAt: null,
        item: {
          deletedAt: null,
          ...(filters.collegeId ? { collegeId: filters.collegeId } : {}),
        },
      },
      ...(filters.status ? { status: filters.status as any } : {}),
      ...(filters.provider ? { provider: filters.provider } : {}),
    };

    if (filters.search) {
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(filters.search);
      
      if (isUuid) {
        where.OR = [
          { id: filters.search },
          { orderId: filters.search },
          { providerPaymentId: { contains: filters.search, mode: "insensitive" } },
        ];
      } else {
        where.OR = [
          { providerPaymentId: { contains: filters.search, mode: "insensitive" } },
          { order: { itemTitle: { contains: filters.search, mode: "insensitive" } } },
          { order: { buyer: { name: { contains: filters.search, mode: "insensitive" } } } },
          { order: { buyer: { username: { contains: filters.search, mode: "insensitive" } } } },
          { order: { buyer: { email: { contains: filters.search, mode: "insensitive" } } } },
          { order: { seller: { name: { contains: filters.search, mode: "insensitive" } } } },
          { order: { seller: { username: { contains: filters.search, mode: "insensitive" } } } },
          { order: { seller: { email: { contains: filters.search, mode: "insensitive" } } } },
        ];
      }
    }

    const selectQuery = {
      id: true,
      orderId: true,
      provider: true,
      providerPaymentId: true,
      amount: true,
      currency: true,
      status: true,
      failureReason: true,
      paidAt: true,
      createdAt: true,
      updatedAt: true,
      order: {
        select: {
          id: true,
          itemTitle: true,
          status: true,
          item: {
            select: {
              id: true,
              title: true,
              status: true,
              college: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
            },
          },
        },
      },
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: selectQuery,
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  },

  getPaymentDetails: async (targetId: string, collegeId?: string) => {
    return prisma.payment.findFirst({
      where: {
        id: targetId,
        order: {
          deletedAt: null,
          item: {
            deletedAt: null,
            ...(collegeId ? { collegeId } : {}),
          },
        },
      },
      select: {
        id: true,
        orderId: true,
        provider: true,
        providerPaymentId: true,
        amount: true,
        currency: true,
        status: true,
        failureReason: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        order: {
          select: {
            id: true,
            itemTitle: true,
            status: true,
            item: {
              select: {
                id: true,
                title: true,
                status: true,
                college: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            buyer: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true,
              },
            },
            seller: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  },
};
