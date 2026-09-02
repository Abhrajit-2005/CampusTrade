import { collegeRepository } from "../repositories/college.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { adminInvitationRepository } from "../repositories/admin-invitation.repository.js";
import { AppError } from "../utils/AppError.js";
import {
  generateInvitationToken,
} from "../utils/tokens.js";
import { emailService } from "./email.service.js";

export const platformAdminService = {
  createCollege: async (
    platformAdminId: string,
    input: {
      name: string;
      domain: string;
      city: string;
      state: string;
      country: string;
    }
  ) => {
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

    const domain = input.domain
      .trim()
      .toLowerCase();

    const existingCollege =
      await collegeRepository.findByDomain(domain);

    if (existingCollege) {
      throw new AppError(
        "A college with this domain already exists",
        409,
        "COLLEGE_DOMAIN_ALREADY_EXISTS"
      );
    }

    const college =
      await collegeRepository.create({
        name: input.name.trim(),
        domain,
        city: input.city.trim(),
        state: input.state.trim(),
        country: input.country.trim(),
      });

    return {
      id: college.id,
      name: college.name,
      domain: college.domain,
      city: college.city,
      state: college.state,
      country: college.country,
      isVerified: college.isVerified,
      createdAt: college.createdAt,
    };
  },
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

    const pendingInvitation =
      await adminInvitationRepository
        .findPendingByEmailAndCollege(
          email,
          college.id
        );

    if (pendingInvitation) {
      throw new AppError(
        "A pending invitation already exists for this email",
        409,
        "INVITATION_ALREADY_PENDING"
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

    await emailService.sendAdminInvitation(
      email,
      input.name.trim(),
      token
    );

   // console.log(`Admin invitation token for ${email}: ${token}`);

    const response = {
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      collegeId: invitation.collegeId,
      expiresAt: invitation.expiresAt,
    };

    return response;
  },
  cleanupExpiredInvitations: async () => {
    return adminInvitationRepository.deleteExpired();
  },
};