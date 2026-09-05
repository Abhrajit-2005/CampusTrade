import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { itemService } from "../services/item.service.js";
import { sendSuccess } from "../utils/response.js";

export const createItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await itemService.createItem(req.user!.sub, req.body);

    return sendSuccess(
      res,
      item,
      "Listing created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const filters: any = {};
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.categoryId) filters.categoryId = req.query.categoryId as string;
    if (req.query.minPrice !== undefined) filters.minPrice = parseInt(req.query.minPrice as string, 10);
    if (req.query.maxPrice !== undefined) filters.maxPrice = parseInt(req.query.maxPrice as string, 10);
    if (req.query.condition) filters.condition = req.query.condition as any;

    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const data = await itemService.getItems(page, limit, filters, sortBy, sortOrder);

    return sendSuccess(
      res,
      data,
      "Listings fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const getMyListings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const data = await itemService.getMyListings(req.user!.sub, page, limit);

    return sendSuccess(
      res,
      data,
      "My listings fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const publishItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await itemService.publishItem(req.user!.sub, req.params.id as string);

    return sendSuccess(
      res,
      item,
      "Listing published successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const getItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await itemService.getItemById(
      req.params.id as string,
      req.user!.sub
    );

    return sendSuccess(
      res,
      item,
      "Listing fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await itemService.updateItem(
      req.user!.sub,
      req.params.id as string,
      req.body
    );

    return sendSuccess(
      res,
      item,
      "Listing updated successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await itemService.deleteItem(req.user!.sub, req.params.id as string);

    return sendSuccess(
      res,
      null,
      "Listing deleted successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};
