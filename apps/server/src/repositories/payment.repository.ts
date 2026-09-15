import { prisma } from "../prisma/client.js";

export const paymentRepository = {
  createPayment: async (data: {
    id: string;
    orderId: string;
    provider: string;
    providerPaymentId: string;
    amount: number;
    currency: string;
  }) => {
    return prisma.payment.create({
      data: {
        id: data.id,
        orderId: data.orderId,
        provider: data.provider,
        providerPaymentId: data.providerPaymentId,
        amount: data.amount,
        currency: data.currency,
        status: "PENDING",
      },
    });
  },

  findByOrderId: async (orderId: string) => {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: async (id: string) => {
    return prisma.payment.findUnique({
      where: { id },
    });
  },

  findByProviderPaymentId: async (providerPaymentId: string) => {
    return prisma.payment.findUnique({
      where: { providerPaymentId },
    });
  },

  updatePaymentFailed: async (paymentId: string, failureReason: string | null) => {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        failureReason,
      },
    });
  },

  confirmPaymentAndOrder: async (paymentId: string, orderId: string) => {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "SUCCESS",
          paidAt: new Date(),
        },
      });

      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
        },
      });

      return { payment, order };
    });
  },

  updatePaymentStatus: async (paymentId: string, status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED") => {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status }
    });
  },

  refundPaymentAndCancelOrder: async (paymentId: string, orderId: string, itemId: string) => {
    return prisma.$transaction(async (tx) => {
      const paymentResult = await tx.payment.updateMany({
        where: { id: paymentId, status: "SUCCESS" },
        data: { status: "REFUNDED" },
      });

      if (paymentResult.count !== 1) {
        throw new Error("Payment status transition failed");
      }

      const orderResult = await tx.order.updateMany({
        where: { id: orderId, status: "CONFIRMED" },
        data: { status: "CANCELLED" },
      });

      if (orderResult.count !== 1) {
        throw new Error("Order status transition failed");
      }

      const itemResult = await tx.item.updateMany({
        where: { id: itemId, status: "RESERVED" },
        data: { status: "AVAILABLE" },
      });

      if (itemResult.count !== 1) {
        throw new Error("Item status transition failed");
      }

      return tx.order.findUnique({
        where: { id: orderId },
        include: { item: true }
      });
    });
  },
};
