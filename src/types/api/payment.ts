/**
 * Payment and payout types
 */

export type PayoutRequest = {
  mentorId: string;
  amount: number;
  description?: string;
};

export type Payout = {
  _id: string;
  payoutId: string;
  mentorId: string;
  amount: number;
  status: "processing" | "completed" | "failed";
  description?: string;
  createdAt: string;
  updatedAt: string;
};
