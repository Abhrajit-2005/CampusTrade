import bcrypt from "bcrypt";
import { collegeRepository } from "../repositories/college.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";
import { generateVerificationToken } from "../utils/tokens.js";
import { emailVerificationRepository } from "../repositories/email-verification.repository.js";
import { hashVerificationToken } from "../utils/tokens.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  verifyEmail: async (token: string) => {
    const tokenHash = hashVerificationToken(token);

    const verificationToken =
      await emailVerificationRepository.findByTokenHash(
        tokenHash
      );

    if (!verificationToken) {
      throw new AppError(
        "Invalid verification token",
        400,
        "INVALID_VERIFICATION_TOKEN"
      );
    }

    if (verificationToken.usedAt) {
      throw new AppError(
        "This verification token has already been used",
        400,
        "VERIFICATION_TOKEN_ALREADY_USED"
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new AppError(
        "This verification token has expired",
        400,
        "VERIFICATION_TOKEN_EXPIRED"
      );
    }

    if (verificationToken.user.isEmailVerified) {
      throw new AppError(
        "Email is already verified",
        400,
        "EMAIL_ALREADY_VERIFIED"
      );
    }

    await emailVerificationRepository.markAsUsed(
      verificationToken.id
    );

    const user =
      await userRepository.updateEmailVerification(
        verificationToken.userId
      );

    return {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
    };
  },
  register: async (input: RegisterInput) => {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(
        "An account with this email already exists",
        409,
        "EMAIL_ALREADY_REGISTERED"
      );
    }

    const emailDomain = input.email.split("@")[1];

    if (!emailDomain) {
      throw new AppError(
        "Invalid email address",
        400,
        "INVALID_EMAIL"
      );
    }

    const college =
      await collegeRepository.findByDomain(emailDomain);

    if (!college) {
      throw new AppError(
        "Registration requires a valid college email address",
        400,
        "COLLEGE_EMAIL_REQUIRED"
      );
    }

    if (!college.isVerified) {
      throw new AppError(
        "This college is not currently accepting registrations",
        403,
        "COLLEGE_NOT_VERIFIED"
      );
    }

    const hashedPassword = await bcrypt.hash(
      input.password,
      12
    );

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      collegeId: college.id,
    });

    const { token, tokenHash } = generateVerificationToken();

    await emailVerificationRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    console.log(
      `Email verification token for ${user.email}: ${token}`
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      collegeId: user.collegeId,
      createdAt: user.createdAt,
    };
  },
};