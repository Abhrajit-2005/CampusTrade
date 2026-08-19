import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";
import { refreshCookieOptions } from "../config/auth.js";
import { AppError } from "../utils/AppError.js";

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

    res.cookie(
      "refreshToken",
      result.refreshToken,
      refreshCookieOptions
    );

    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
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

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        "Refresh token is required",
        401,
        "REFRESH_TOKEN_REQUIRED"
      );
    }

    const result =
      await authService.refreshAccessToken(
        refreshToken
      );

    res.cookie(
      "refreshToken",
      result.refreshToken,
      refreshCookieOptions
    );

    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Token refreshed successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie(
      "refreshToken",
      refreshCookieOptions
    );

    return sendSuccess(
      res,
      null,
      "Logout successful"
    );
  } catch (error) {
    next(error);
  }
};