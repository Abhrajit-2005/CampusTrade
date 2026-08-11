import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { collegeAdminService } from "../services/college-admin.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";

export const approveUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    if (typeof userId !== "string") {
      throw new AppError("Invalid user ID", 400, "BAD_REQUEST");
    }

    const result =
      await collegeAdminService.approveUser(
        req.user!.sub,
        userId
      );

    return sendSuccess(
      res,
      result,
      "User approved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const rejectUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    if (typeof userId !== "string") {
      throw new AppError("Invalid user ID", 400, "BAD_REQUEST");
    }

    const result =
      await collegeAdminService.rejectUser(
        req.user!.sub,
        userId
      );

    return sendSuccess(
      res,
      result,
      "User rejected successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getPendingUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users =
      await collegeAdminService.getPendingUsers(
        req.user!.sub
      );

    return sendSuccess(
      res,
      users,
      "Pending users fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};