/**
 * Authentication related types
 */

import type { AdminUser } from "./admin";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  status: string;
  message: string;
  user: AdminUser;
  token: string;
  refreshToken: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  status: string;
  message: string;
  token: string;
  refreshToken: string;
};
