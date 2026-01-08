"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";

import { createCourseStore, type CourseState } from "./course-store";

export type CourseStoreApi = ReturnType<typeof createCourseStore>;

export const CourseStoreContext = createContext<CourseStoreApi | undefined>(undefined);

export interface CourseStoreProviderProps {
  children: ReactNode;
}

export const CourseStoreProvider = ({ children }: CourseStoreProviderProps) => {
  const storeRef = useRef<CourseStoreApi | null>(null);
  if (storeRef.current == null) {
    storeRef.current = createCourseStore();
  }

  return <CourseStoreContext.Provider value={storeRef.current}>{children}</CourseStoreContext.Provider>;
};

export const useCourseStore = <T,>(selector: (store: CourseState) => T): T => {
  const courseStoreContext = useContext(CourseStoreContext);

  if (!courseStoreContext) {
    throw new Error("useCourseStore must be used within CourseStoreProvider");
  }

  return useStore(courseStoreContext, selector);
};
