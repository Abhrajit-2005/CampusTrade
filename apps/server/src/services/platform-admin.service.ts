import { collegeRepository } from "../repositories/college.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";
import {
  generateInvitationToken,
} from "../utils/tokens.js";

export const platformAdminService = {
  createCollegeAdminInvitation: async (
    platformAdminId: string,
    collegeId: string,
    input: {
      name: string;
      email: string;
    }
  ) => {
    // Verify that the requester is a platform admin
    const platformAdmin =
      await userRepository.findByIdWithCollege(
        platformAdminId
      );

    if (!platformAdmin) {
      throw new AppError(
        "Platform admin not found",
        404,
        "ADMIN_NOT_FOUND"
      );
    }

    if (platformAdmin.role !== "PLATFORM_ADMIN") {
      throw new AppError(
        "Platform administrator access required",
        403,
        "FORBIDDEN"
      );
    }

    // Verify that the college exists
    const college =
      await collegeRepository.findById(collegeId);

    if (!college) {
      throw new AppError(
        "College not found",
        404,
        "COLLEGE_NOT_FOUND"
      );
    }

    // Normalize email
    const email = input.email.trim().toLowerCase();

    const emailDomain = email.split("@")[1];

    // Admin must use the college's official domain
    if (
      !emailDomain ||
      emailDomain !== college.domain.toLowerCase()
    ) {
      throw new AppError(
        "Administrator email must belong to the college domain",
        400,
        "INVALID_COLLEGE_EMAIL"
      );
    }

    // Make sure this email isn't already registered
    const existingUser =
      await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        "A user with this email already exists",
        409,
        "EMAIL_ALREADY_REGISTERED"
      );
    }

    // Generate invitation token
    const { token, tokenHash } =
      generateInvitationToken();

    // Invitation valid for 24 hours
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const invitation =
      await collegeRepository.createAdminInvitation({
        name: input.name.trim(),
        email,
        tokenHash,
        collegeId: college.id,
        expiresAt,
      });

    // Temporary development logging.
    // Later this will be replaced by the email service.
    console.log(
      `Admin invitation token for ${email}: ${token}`
    );

    return {
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      collegeId: invitation.collegeId,
      expiresAt: invitation.expiresAt,
    };
  },
};