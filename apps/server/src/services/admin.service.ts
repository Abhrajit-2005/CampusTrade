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
  }
};
