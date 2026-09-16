import { adminRepository } from "../repositories/admin.repository.js";
import { collegeRepository } from "../repositories/college.repository.js";
import { AppError } from "../utils/AppError.js";

export const adminService = {
  getPlatformStats: async () => {
    const stats = await adminRepository.getAggregateStats();
    return {
      scope: "PLATFORM",
      college: null,
      ...stats
    };
  },

  getCollegeStats: async (collegeId: string) => {
    const college = await collegeRepository.findById(collegeId);
    
    if (!college || college.deletedAt) {
      throw new AppError("College not found", 404, "COLLEGE_NOT_FOUND");
    }

    const stats = await adminRepository.getAggregateStats({ collegeId });
    
    return {
      scope: "COLLEGE",
      college: {
        id: college.id,
        name: college.name,
      },
      users: stats.users,
      listings: stats.listings,
      orders: stats.orders,
      payments: stats.payments,
    };
  },

  getUsers: async (
    page: number,
    limit: number,
    filters: {
      collegeId?: string;
      search?: string;
      status?: string;
    }
  ) => {
    const { users, total } = await adminRepository.getUsersWithPagination(
      page,
      limit,
      filters
    );

    return {
      users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  getUserById: async (targetId: string, collegeId?: string) => {
    const user = await adminRepository.getUserDetails(targetId, collegeId);
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }
    return user;
  },

  updateUserStatus: async (
    targetId: string,
    newStatus: "ACTIVE" | "SUSPENDED",
    adminRole: string,
    adminId: string,
    adminCollegeId?: string
  ) => {
    const target = await adminRepository.getUserDetails(targetId, adminCollegeId);

    if (!target) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    if (target.id === adminId) {
      throw new AppError("You cannot suspend yourself", 403, "FORBIDDEN");
    }

    if (target.role === "PLATFORM_ADMIN" || (adminRole === "COLLEGE_ADMIN" && target.role === "COLLEGE_ADMIN")) {
      throw new AppError("You cannot modify this admin's status", 403, "FORBIDDEN");
    }

    if (target.status !== "ACTIVE" && target.status !== "SUSPENDED") {
      throw new AppError("User status cannot be modified via this endpoint", 409, "CONFLICT");
    }

    if (target.status === newStatus) {
      throw new AppError(`User is already ${newStatus}`, 409, "CONFLICT");
    }

    const result = await adminRepository.updateUserStatus(
      targetId,
      newStatus,
      target.status as "ACTIVE" | "SUSPENDED",
      adminRole,
      adminId,
      adminCollegeId
    );

    if (result.count === 0) {
      throw new AppError("Failed to update user status due to concurrent modification", 409, "CONFLICT");
    }

    return { status: newStatus };
  },

  getItems: async (
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
    const { items, total } = await adminRepository.getItemsWithPagination(
      page,
      limit,
      filters
    );

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  getItemById: async (targetId: string, collegeId?: string) => {
    const item = await adminRepository.getItemDetails(targetId, collegeId);
    if (!item) {
      throw new AppError("Item not found", 404, "NOT_FOUND");
    }
    return item;
  },

  updateItemStatus: async (
    targetId: string,
    newStatus: string,
    adminCollegeId?: string
  ) => {
    const target = await adminRepository.getItemDetails(targetId, adminCollegeId);

    if (!target) {
      throw new AppError("Item not found", 404, "NOT_FOUND");
    }

    if (target.status === "REMOVED") {
      throw new AppError("Item is already removed", 409, "CONFLICT");
    }

    if (target.status !== "AVAILABLE" && target.status !== "DRAFT") {
      throw new AppError("Item cannot be removed from its current status", 409, "CONFLICT");
    }

    const result = await adminRepository.updateItemStatus(
      targetId,
      newStatus,
      ["AVAILABLE", "DRAFT"],
      adminCollegeId
    );

    if (result.count === 0) {
      throw new AppError("Failed to update item status due to concurrent modification", 409, "CONFLICT");
    }

    return { status: newStatus };
  },

  getOrders: async (
    page: number,
    limit: number,
    filters: {
      collegeId?: string;
      search?: string;
      status?: string;
    }
  ) => {
    const { orders, total } = await adminRepository.getOrdersWithPagination(
      page,
      limit,
      filters
    );

    return {
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  getOrderById: async (targetId: string, collegeId?: string) => {
    const order = await adminRepository.getOrderDetails(targetId, collegeId);
    if (!order) {
      throw new AppError("Order not found", 404, "NOT_FOUND");
    }
    return order;
  },
};
