import { Router } from "express";
import { addWishlist, removeWishlist, checkWishlist, getWishlist } from "../controllers/wishlist.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { addWishlistSchema, wishlistParamsSchema, getWishlistSchema } from "../validators/wishlist.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(addWishlistSchema),
  addWishlist
);

router.delete(
  "/:itemId",
  authenticate,
  validate(wishlistParamsSchema),
  removeWishlist
);

router.get(
  "/check/:itemId",
  authenticate,
  validate(wishlistParamsSchema),
  checkWishlist
);

router.get(
  "/",
  authenticate,
  validate(getWishlistSchema),
  getWishlist
);

export default router;
