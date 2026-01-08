/**
 * Authentication related types
 */

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  status: string;
  message: string;
  user: {
    _id: string;
    email: string;
    role: "admin" | "super-admin";
    status: boolean;
    realWallet: number;
    virtualWallet: number;
    wallet: number;
    fcmToken?: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
};
