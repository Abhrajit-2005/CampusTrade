import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { adminService } from "../services/admin.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    let data;

    if (role === "PLATFORM_ADMIN") {
      data = await adminService.getPlatformStats();
    } else if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      data = await adminService.getCollegeStats(user.collegeId);
    } else {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    return sendSuccess(
      res,
      data,
      "Dashboard statistics fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};
