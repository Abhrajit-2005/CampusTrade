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

export const getAdminUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { page, limit, search, status } = req.query as any;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const filters: any = {};
    if (targetCollegeId) filters.collegeId = targetCollegeId;
    if (search) filters.search = search;
    if (status) filters.status = status;

    const data = await adminService.getUsers(page, limit, filters);

    return sendSuccess(res, data, "Admin users fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getAdminUserDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { id } = req.params;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const data = await adminService.getUserById(id as string, targetCollegeId);

    return sendSuccess(res, data, "Admin user details fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const updateAdminUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { id } = req.params;
    const { status } = req.body;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const data = await adminService.updateUserStatus(
      id as string,
      status,
      role,
      sub,
      targetCollegeId
    );

    return sendSuccess(res, data, "User status updated successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getAdminItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { page, limit, search, status, categoryId, condition } = req.query as any;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const filters: any = {};
    if (targetCollegeId) filters.collegeId = targetCollegeId;
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (categoryId) filters.categoryId = categoryId;
    if (condition) filters.condition = condition;

    const data = await adminService.getItems(page, limit, filters);

    return sendSuccess(res, data, "Admin items fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getAdminItemDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { id } = req.params;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const data = await adminService.getItemById(id as string, targetCollegeId);

    return sendSuccess(res, data, "Admin item details fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const updateAdminItemStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { id } = req.params;
    const { status } = req.body;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const data = await adminService.updateItemStatus(
      id as string,
      status,
      targetCollegeId
    );

    return sendSuccess(res, data, "Item status updated successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { page, limit, search, status } = req.query as any;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const filters: any = {};
    if (targetCollegeId) filters.collegeId = targetCollegeId;
    if (search) filters.search = search;
    if (status) filters.status = status;

    const data = await adminService.getOrders(page, limit, filters);

    return sendSuccess(res, data, "Admin orders fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, sub } = req.user!;
    const { id } = req.params;

    let targetCollegeId: string | undefined = undefined;

    if (role === "COLLEGE_ADMIN") {
      const user = await userRepository.findById(sub);
      if (!user || !user.collegeId) {
        throw new AppError("Admin college association missing", 403, "FORBIDDEN");
      }
      targetCollegeId = user.collegeId;
    } else if (role !== "PLATFORM_ADMIN") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const data = await adminService.getOrderById(id as string, targetCollegeId);

    return sendSuccess(res, data, "Admin order details fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};
