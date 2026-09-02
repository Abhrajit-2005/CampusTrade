import { categoryRepository } from "../repositories/category.repository.js";

export const categoryService = {
  getCategories: async () => {
    return categoryRepository.findAllActive();
  },
};
