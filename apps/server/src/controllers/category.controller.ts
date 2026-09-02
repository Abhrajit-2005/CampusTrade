import { NextFunction, Request, Response } from "express";
import { categoryService } from "../services/category.service.js";
import { sendSuccess } from "../utils/response.js";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await categoryService.getCategories();

    return sendSuccess(
      res,
      categories,
      "Categories fetched successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};
