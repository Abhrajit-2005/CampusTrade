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

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const token = authorization.substring(7);

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};