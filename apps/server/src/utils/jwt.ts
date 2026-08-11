import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
}

const accessTokenOptions: SignOptions = {
  expiresIn:
    env.ACCESS_TOKEN_EXPIRES_IN as NonNullable<
      SignOptions["expiresIn"]
    >,
};

const refreshTokenOptions: SignOptions = {
  expiresIn:
    env.REFRESH_TOKEN_EXPIRES_IN as NonNullable<
      SignOptions["expiresIn"]
    >,
};

export const generateAccessToken = (
  payload: AccessTokenPayload
): string => {
  return jwt.sign(
    payload,
    env.ACCESS_TOKEN_SECRET,
    accessTokenOptions
  );
};

export const generateRefreshToken = (
  payload: RefreshTokenPayload
): string => {
  return jwt.sign(
    payload,
    env.REFRESH_TOKEN_SECRET,
    refreshTokenOptions
  );
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  return jwt.verify(
    token,
    env.ACCESS_TOKEN_SECRET
  ) as AccessTokenPayload;
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  return jwt.verify(
    token,
    env.REFRESH_TOKEN_SECRET
  ) as RefreshTokenPayload;
};