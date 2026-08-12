import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.register(req.body);

    return sendSuccess(
      res,
      user,
      "Registration successful",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.verifyEmail(
      req.body.token
    );

    return sendSuccess(
      res,
      result,
      "Email verified successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.login(req.body);

    return sendSuccess(
      res,
      result,
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
};

export const acceptAdminInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await authService.acceptAdminInvitation(
        req.body
      );

    return sendSuccess(
      res,
      result,
      "College administrator account created successfully"
    );
  } catch (error) {
    next(error);
  }
};