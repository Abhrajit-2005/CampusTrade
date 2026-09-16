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
  }
};
