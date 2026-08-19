import { NextFunction, Request, Response } from "express";
import {
  AccessTokenPayload,
  verifyAccessToken,
} from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const [scheme, token] = authorization.split(" ");

    if (
      scheme !== "Bearer" ||
      !token ||
      token.trim().length === 0
    ) {
      throw new AppError(
        "Invalid authorization header",
        401,
        "INVALID_AUTHORIZATION_HEADER"
      );
    }

    const payload = verifyAccessToken(token.trim());

    if (!payload.sub || !payload.role) {
      throw new AppError(
        "Invalid access token",
        401,
        "INVALID_ACCESS_TOKEN"
      );
    }

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};