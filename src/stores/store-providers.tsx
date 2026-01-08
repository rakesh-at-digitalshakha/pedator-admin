"use client";

import { BookingStoreProvider } from "@/stores/booking/booking-provider";
import { CourseStoreProvider } from "@/stores/course/course-provider";
import { LearnerStoreProvider } from "@/stores/learner/learner-provider";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <LearnerStoreProvider>
      <CourseStoreProvider>
        <BookingStoreProvider>{children}</BookingStoreProvider>
      </CourseStoreProvider>
    </LearnerStoreProvider>
  );
}
