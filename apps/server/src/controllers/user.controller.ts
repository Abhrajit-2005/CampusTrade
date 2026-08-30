import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { userService } from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await userService.getMyProfile(
      req.user!.sub
    );

    return sendSuccess(
      res,
      profile,
      "Profile retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await userService.updateMyProfile(
      req.user!.sub,
      req.body
    );

    return sendSuccess(
      res,
      profile,
      "Profile updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      throw new AppError("Invalid user ID", 400, "BAD_REQUEST");
    }

    const profile =
      await userService.getPublicProfile(id);

    return sendSuccess(
      res,
      profile,
      "Profile retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};
