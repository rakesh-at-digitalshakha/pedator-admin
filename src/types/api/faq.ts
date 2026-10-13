export type FaqAudience = "mentor" | "learner" | "all";

export type Faq = {
  _id: string;
  question: string;
  answer: string;
  audience: FaqAudience;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FaqRequest = {
  question: string;
  answer: string;
  audience?: FaqAudience;
  order?: number;
  isActive?: boolean;
};
