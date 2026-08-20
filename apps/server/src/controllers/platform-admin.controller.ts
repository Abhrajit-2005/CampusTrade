import {
  NextFunction,
  Response,
} from "express";

import { platformAdminService } from "../services/platform-admin.service.js";
import { sendSuccess } from "../utils/response.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { AppError } from "../utils/AppError.js";

export const createCollege = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const college =
      await platformAdminService.createCollege(
        req.user!.sub,
        req.body
      );

    return sendSuccess(
      res,
      college,
      "College created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const createCollegeAdminInvitation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { collegeId } = req.params;

    if (!collegeId || Array.isArray(collegeId)) {
      throw new AppError(
        "A valid college ID is required",
        400,
        "INVALID_COLLEGE_ID"
      );
    }

    const invitation =
      await platformAdminService.createCollegeAdminInvitation(
        req.user!.sub,
        collegeId,
        req.body
      );

    return sendSuccess(
      res,
      invitation,
      "College administrator invitation created successfully"
    );
  } catch (error) {
    next(error);
  }
};