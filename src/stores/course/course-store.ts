import { createStore } from "zustand/vanilla";

import type { Course } from "@/types/api";

export type CourseState = {
  courses: Course[];
  selectedCourse: Course | null;
  setCourses: (courses: Course[]) => void;
  setSelectedCourse: (course: Course | null) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  removeCourse: (id: string) => void;
  clearCourses: () => void;
};

export const createCourseStore = (init?: Partial<CourseState>) =>
  createStore<CourseState>()((set) => ({
    courses: init?.courses ?? [],
    selectedCourse: init?.selectedCourse ?? null,

    setCourses: (courses) => set({ courses }),

    setSelectedCourse: (course) => set({ selectedCourse: course }),

    addCourse: (course) =>
      set((state) => ({
        courses: [...state.courses, course],
      })),

    updateCourse: (id, updates) =>
      set((state) => ({
        courses: state.courses.map((course) => (course._id === id ? { ...course, ...updates } : course)),
        selectedCourse:
          state.selectedCourse?._id === id ? { ...state.selectedCourse, ...updates } : state.selectedCourse,
      })),

    removeCourse: (id) =>
      set((state) => ({
        courses: state.courses.filter((course) => course._id !== id),
        selectedCourse: state.selectedCourse?._id === id ? null : state.selectedCourse,
      })),

    clearCourses: () => set({ courses: [], selectedCourse: null }),
  }));
