import { NextFunction, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { AuthenticatedRequest } from "./auth.middleware.js";

export const authorizeRoles = (
  ...allowedRoles: string[]
) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      next(
        new AppError(
          "Authentication required",
          401,
          "AUTHENTICATION_REQUIRED"
        )
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          "You do not have permission to perform this action",
          403,
          "FORBIDDEN"
        )
      );
      return;
    }

    next();
  };
};