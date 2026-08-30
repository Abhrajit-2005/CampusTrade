import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";

interface UpdateProfileInput {
  name?: string;
  username?: string | null;
  bio?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  location?: string | null;
}

export const userService = {
  getMyProfile: async (userId: string) => {
    const user =
      await userRepository.findByIdWithCollege(userId);

    if (!user) {
      throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND"
      );
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      profileImage: user.profileImage,
      location: user.location,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      collegeId: user.collegeId,
      college: user.college
        ? {
            id: user.college.id,
            name: user.college.name,
            domain: user.college.domain,
            city: user.college.city,
            state: user.college.state,
            country: user.college.country,
          }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  updateMyProfile: async (
    userId: string,
    data: UpdateProfileInput
  ) => {
    const user =
      await userRepository.findById(userId);

    if (!user) {
      throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND"
      );
    }

    if (data.username !== undefined && data.username !== null) {
      const existing =
        await userRepository.findByUsername(
          data.username
        );

      if (existing && existing.id !== userId) {
        throw new AppError(
          "This username is already taken",
          409,
          "USERNAME_ALREADY_TAKEN"
        );
      }
    }

    const updated =
      await userRepository.updateProfile(userId, data);

    return {
      id: updated.id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      phone: updated.phone,
      bio: updated.bio,
      profileImage: updated.profileImage,
      location: updated.location,
      role: updated.role,
      status: updated.status,
      isEmailVerified: updated.isEmailVerified,
      averageRating: updated.averageRating,
      totalReviews: updated.totalReviews,
      collegeId: updated.collegeId,
      college: updated.college
        ? {
            id: updated.college.id,
            name: updated.college.name,
            domain: updated.college.domain,
            city: updated.college.city,
            state: updated.college.state,
            country: updated.college.country,
          }
        : null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  },

  getPublicProfile: async (userId: string) => {
    const user =
      await userRepository.findByIdWithCollege(userId);

    if (!user || user.deletedAt) {
      throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND"
      );
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
      location: user.location,
      role: user.role,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      college: user.college
        ? {
            id: user.college.id,
            name: user.college.name,
            city: user.college.city,
            state: user.college.state,
            country: user.college.country,
          }
        : null,
      createdAt: user.createdAt,
    };
  },
};
