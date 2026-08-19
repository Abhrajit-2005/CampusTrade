import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/tokens.js";

import {
  refreshSessionRepository,
} from "../repositories/refresh-session.repository.js";

import { AppError } from "../utils/AppError.js";

const REFRESH_TOKEN_TTL_DAYS = 7;

export const refreshSessionService = {
  create: async (userId: string) => {
    const token = generateRefreshToken();
    const tokenHash = hashRefreshToken(token);

    const expiresAt = new Date(
      Date.now() +
      REFRESH_TOKEN_TTL_DAYS *
      24 *
      60 *
      60 *
      1000
    );

    await refreshSessionRepository.create({
      tokenHash,
      userId,
      expiresAt,
    });

    return {
      token,
      expiresAt,
    };
  },

  revoke: async (token: string) => {
    const tokenHash = hashRefreshToken(token);

    const session =
      await refreshSessionRepository.findByTokenHash(
        tokenHash
      );

    if (!session) {
      return;
    }

    await refreshSessionRepository.revoke(
      session.id
    );
  },

  refresh: async (token: string) => {
    const tokenHash = hashRefreshToken(token);

    const session =
      await refreshSessionRepository.findByTokenHash(
        tokenHash
      );

    if (!session) {
      throw new AppError(
        "Invalid refresh token",
        401,
        "INVALID_REFRESH_TOKEN"
      );
    }

    if (session.revokedAt) {
      throw new AppError(
        "Refresh token has been revoked",
        401,
        "REFRESH_TOKEN_REVOKED"
      );
    }

    if (session.expiresAt <= new Date()) {
      throw new AppError(
        "Refresh token has expired",
        401,
        "REFRESH_TOKEN_EXPIRED"
      );
    }

    // Revoke the old session before creating a new one.
    await refreshSessionRepository.revoke(session.id);

    const newSession =
      await refreshSessionService.create(
        session.user.id
      );

    return {
      user: session.user,
      refreshToken: newSession.token,
    };
  },
};