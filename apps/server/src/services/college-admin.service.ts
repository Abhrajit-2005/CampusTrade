import { AppError } from "../utils/AppError.js";
import { userRepository } from "../repositories/user.repository.js";

export const collegeAdminService = {
    approveUser: async (
        adminUserId: string,
        targetUserId: string
    ) => {
        const admin =
            await userRepository.findByIdWithCollege(adminUserId);

        if (!admin) {
            throw new AppError(
                "Admin user not found",
                404,
                "ADMIN_NOT_FOUND"
            );
        }

        if (admin.role !== "COLLEGE_ADMIN") {
            throw new AppError(
                "You are not a college administrator",
                403,
                "FORBIDDEN"
            );
        }

        const target =
            await userRepository.findByIdWithCollege(targetUserId);

        if (!target) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        if (target.collegeId !== admin.collegeId) {
            throw new AppError(
                "You cannot manage users from another college",
                403,
                "CROSS_COLLEGE_ACCESS_DENIED"
            );
        }

        if (!target.isEmailVerified) {
            throw new AppError(
                "User email has not been verified",
                400,
                "EMAIL_NOT_VERIFIED"
            );
        }

        if (target.status !== "PENDING_COLLEGE_APPROVAL") {
            throw new AppError(
                "User is not awaiting college approval",
                400,
                "INVALID_APPROVAL_STATE"
            );
        }

        const user = await userRepository.updateStatus(
            target.id,
            "ACTIVE"
        );

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            collegeId: user.collegeId,
        };
    },

    rejectUser: async (
        adminUserId: string,
        targetUserId: string
    ) => {
        const admin =
            await userRepository.findByIdWithCollege(adminUserId);

        if (!admin) {
            throw new AppError(
                "Admin user not found",
                404,
                "ADMIN_NOT_FOUND"
            );
        }

        if (admin.role !== "COLLEGE_ADMIN") {
            throw new AppError(
                "You are not a college administrator",
                403,
                "FORBIDDEN"
            );
        }

        const target =
            await userRepository.findByIdWithCollege(targetUserId);

        if (!target) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        if (target.collegeId !== admin.collegeId) {
            throw new AppError(
                "You cannot manage users from another college",
                403,
                "CROSS_COLLEGE_ACCESS_DENIED"
            );
        }

        if (!target.isEmailVerified) {
            throw new AppError(
                "User email has not been verified",
                400,
                "EMAIL_NOT_VERIFIED"
            );
        }

        if (target.status !== "PENDING_COLLEGE_APPROVAL") {
            throw new AppError(
                "User is not awaiting college approval",
                400,
                "INVALID_APPROVAL_STATE"
            );
        }

        const user = await userRepository.updateStatus(
            target.id,
            "REJECTED"
        );

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            collegeId: user.collegeId,
        };
    },

    getPendingUsers: async (adminUserId: string) => {
        const admin =
            await userRepository.findByIdWithCollege(adminUserId);

        if (!admin) {
            throw new AppError(
                "Admin user not found",
                404,
                "ADMIN_NOT_FOUND"
            );
        }

        if (admin.role !== "COLLEGE_ADMIN") {
            throw new AppError(
                "You are not a college administrator",
                403,
                "FORBIDDEN"
            );
        }

        return userRepository.findPendingByCollegeId(
            admin.collegeId
        );
    },
};