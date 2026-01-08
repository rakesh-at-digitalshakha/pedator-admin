"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";

import { createLearnerStore, type LearnerState } from "./learner-store";

export type LearnerStoreApi = ReturnType<typeof createLearnerStore>;

export const LearnerStoreContext = createContext<LearnerStoreApi | undefined>(undefined);

export interface LearnerStoreProviderProps {
  children: ReactNode;
}

export const LearnerStoreProvider = ({ children }: LearnerStoreProviderProps) => {
  const storeRef = useRef<LearnerStoreApi | null>(null);
  if (storeRef.current == null) {
    storeRef.current = createLearnerStore();
  }

  return <LearnerStoreContext.Provider value={storeRef.current}>{children}</LearnerStoreContext.Provider>;
};

export const useLearnerStore = <T,>(selector: (store: LearnerState) => T): T => {
  const learnerStoreContext = useContext(LearnerStoreContext);

  if (!learnerStoreContext) {
    throw new Error("useLearnerStore must be used within LearnerStoreProvider");
  }

  return useStore(learnerStoreContext, selector);
};
