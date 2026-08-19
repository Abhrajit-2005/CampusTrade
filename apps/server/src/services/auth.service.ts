import bcrypt from "bcrypt";
import { collegeRepository } from "../repositories/college.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";
import { generateVerificationToken } from "../utils/tokens.js";
import { emailVerificationRepository } from "../repositories/email-verification.repository.js";
import { hashVerificationToken } from "../utils/tokens.js";
import { generateAccessToken } from "../utils/jwt.js";
import {
  adminInvitationRepository,
} from "../repositories/admin-invitation.repository.js";
import {
  hashInvitationToken,
} from "../utils/tokens.js";
import {
  refreshSessionService,
} from "./refresh-session.service.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (input: {
    email: string;
    password: string;
  }) => {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.password
    );

    if (!passwordMatches) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        "Please verify your email before logging in",
        403,
        "EMAIL_NOT_VERIFIED"
      );
    }

    if (user.status === "PENDING_COLLEGE_APPROVAL") {
      throw new AppError(
        "Your account is awaiting college approval",
        403,
        "COLLEGE_APPROVAL_PENDING"
      );
    }

    if (user.status === "REJECTED") {
      throw new AppError(
        "Your college registration was rejected",
        403,
        "COLLEGE_APPROVAL_REJECTED"
      );
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(
        "Your account has been suspended",
        403,
        "ACCOUNT_SUSPENDED"
      );
    }

    if (user.status === "BANNED") {
      throw new AppError(
        "Your account has been banned",
        403,
        "ACCOUNT_BANNED"
      );
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(
        "Your account is not active",
        403,
        "ACCOUNT_NOT_ACTIVE"
      );
    }

    const refreshSession = await refreshSessionService.create(user.id);

    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        collegeId: user.collegeId,
      },
      accessToken,
      refreshToken: refreshSession.token
    };
  },
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
  acceptAdminInvitation: async (input: {
    token: string;
    password: string;
  }) => {
    const tokenHash = hashInvitationToken(input.token);

    const invitation =
      await adminInvitationRepository.findByTokenHash(
        tokenHash
      );

    if (!invitation) {
      throw new AppError(
        "Invalid invitation token",
        400,
        "INVALID_INVITATION_TOKEN"
      );
    }

    if (invitation.acceptedAt) {
      throw new AppError(
        "This invitation has already been accepted",
        400,
        "INVITATION_ALREADY_ACCEPTED"
      );
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError(
        "This invitation has expired",
        400,
        "INVITATION_EXPIRED"
      );
    }

    const existingUser =
      await userRepository.findByEmail(
        invitation.email
      );

    if (existingUser) {
      throw new AppError(
        "A user with this email already exists",
        409,
        "EMAIL_ALREADY_REGISTERED"
      );
    }

    const hashedPassword = await bcrypt.hash(
      input.password,
      12
    );

    const user =
      await userRepository.createCollegeAdmin({
        name: invitation.name,
        email: invitation.email,
        password: hashedPassword,
        collegeId: invitation.collegeId,
      });

    await adminInvitationRepository.markAsAccepted(
      invitation.id
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      collegeId: user.collegeId,
    };
  },
  refreshAccessToken: async (refreshToken: string) => {
    const result =
      await refreshSessionService.refresh(
        refreshToken
      );

    const user = result.user;

    if (!user.isEmailVerified) {
      throw new AppError(
        "Email verification required",
        403,
        "EMAIL_NOT_VERIFIED"
      );
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(
        "Your account is not active",
        403,
        "ACCOUNT_NOT_ACTIVE"
      );
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        collegeId: user.collegeId,
      },
      accessToken,
      refreshToken: result.refreshToken,
    };
  },
  logout: async (refreshToken: string) => {
    await refreshSessionService.revoke(refreshToken);
  },
};