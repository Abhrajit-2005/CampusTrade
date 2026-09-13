import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { wishlistService } from "../services/wishlist.service.js";
import { sendSuccess } from "../utils/response.js";

export const addWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.body;
    const wishlist = await wishlistService.addWishlist(req.user!.sub, itemId);

    return sendSuccess(
      res,
      wishlist,
      "Item added to wishlist successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const removeWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const itemId = req.params.itemId as string;
    await wishlistService.removeWishlist(req.user!.sub, itemId);

    return sendSuccess(
      res,
      null,
      "Item removed from wishlist successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const checkWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const itemId = req.params.itemId as string;
    const data = await wishlistService.checkWishlist(req.user!.sub, itemId);

    return sendSuccess(
      res,
      data,
      "Wishlist status checked successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const data = await wishlistService.getWishlist(req.user!.sub, page, limit);

    return sendSuccess(
      res,
      data,
      "Wishlist fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};
