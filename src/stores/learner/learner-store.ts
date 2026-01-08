import { createStore } from "zustand/vanilla";

import type { LearnerUser } from "@/types/api";

export type LearnerState = {
  learners: LearnerUser[];
  selectedLearner: LearnerUser | null;
  setLearners: (learners: LearnerUser[]) => void;
  setSelectedLearner: (learner: LearnerUser | null) => void;
  addLearner: (learner: LearnerUser) => void;
  updateLearner: (id: string, updates: Partial<LearnerUser>) => void;
  removeLearner: (id: string) => void;
  clearLearners: () => void;
};

export const createLearnerStore = (init?: Partial<LearnerState>) =>
  createStore<LearnerState>()((set) => ({
    learners: init?.learners ?? [],
    selectedLearner: init?.selectedLearner ?? null,

    setLearners: (learners) => set({ learners }),

    setSelectedLearner: (learner) => set({ selectedLearner: learner }),

    addLearner: (learner) =>
      set((state) => ({
        learners: [...state.learners, learner],
      })),

    updateLearner: (id, updates) =>
      set((state) => ({
        learners: state.learners.map((learner) => (learner._id === id ? { ...learner, ...updates } : learner)),
        selectedLearner:
          state.selectedLearner?._id === id ? { ...state.selectedLearner, ...updates } : state.selectedLearner,
      })),

    removeLearner: (id) =>
      set((state) => ({
        learners: state.learners.filter((learner) => learner._id !== id),
        selectedLearner: state.selectedLearner?._id === id ? null : state.selectedLearner,
      })),

    clearLearners: () => set({ learners: [], selectedLearner: null }),
  }));
