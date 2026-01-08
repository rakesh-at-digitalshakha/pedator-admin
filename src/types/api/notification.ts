/**
 * Notification types
 */

export type Notification = {
  _id: string;
  title: string;
  body: string;
  message?: string; // Alias for body for backward compatibility
  data?: Record<string, any>; // Optional additional data
  recipientId: string;
  recipientModel: "learners" | "mentors" | "adminusers";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveFCMTokenRequest = {
  fcmToken: string;
};
