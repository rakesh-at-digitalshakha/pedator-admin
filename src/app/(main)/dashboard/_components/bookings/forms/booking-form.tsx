"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/types/api";
import { useGetAllCourses } from "@/hooks/api/use-course";
import { useGetAllLearners } from "@/hooks/api/use-learner";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";

export type CourseSlot = {
  slotId: string;
  courseId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type BookingFormValues = {
  courseId: string;
  courseSlotId: string;
  learnerId: string;
  bookingDate: string;
  bookingStatus: Booking["bookingStatus"];
  paymentStatus: Booking["paymentStatus"];
  amount?: number;
};

export function BookingForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: {
  initialValues: BookingFormValues;
  onSubmit: (values: BookingFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = React.useState<BookingFormValues>(initialValues);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>(initialValues.courseId || "");
  const [selectedBookingDate, setSelectedBookingDate] = React.useState<string>(initialValues.bookingDate || "");
  const [slots, setSlots] = React.useState<CourseSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);

  // Fetch all courses
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCourses({ limit: 1000 });
  const courses = coursesData?.data?.data || [];

  // Fetch all learners
  const { data: learnersData, isLoading: learnersLoading } = useGetAllLearners({ limit: 1000 });
  const learners = learnersData?.data || [];

  // Fetch slots when course and date are selected
  React.useEffect(() => {
    if (selectedCourseId && selectedBookingDate) {
      setLoadingSlots(true);
      const dateStr = new Date(selectedBookingDate).toISOString().split("T")[0];
      apiClient
        .get<ApiResponse<CourseSlot[]>>(`/slots/course/${selectedCourseId}?date=${dateStr}`)
        .then((response) => {
          setSlots(response.data.data || []);
        })
        .catch(() => {
          setSlots([]);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    } else {
      setSlots([]);
    }
  }, [selectedCourseId, selectedBookingDate]);

  // Update courseSlotId when course changes
  React.useEffect(() => {
    if (selectedCourseId && selectedCourseId !== values.courseId) {
      setValues((v) => ({ ...v, courseId: selectedCourseId, courseSlotId: "" }));
    }
  }, [selectedCourseId]);

  // Update bookingDate when date changes
  React.useEffect(() => {
    if (selectedBookingDate && selectedBookingDate !== values.bookingDate) {
      setValues((v) => ({ ...v, bookingDate: selectedBookingDate }));
    }
  }, [selectedBookingDate]);

  // Update course price when course changes
  React.useEffect(() => {
    const course = courses.find((c) => c._id === selectedCourseId);
    if (course && !values.amount) {
      setValues((v) => ({ ...v, amount: course.price }));
    }
  }, [selectedCourseId, courses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course">Course *</Label>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={loading || coursesLoading}>
          <SelectTrigger id="course">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {coursesLoading ? (
              <div className="p-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title} - ₹{course.price}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="learner">Learner *</Label>
        <Select value={values.learnerId} onValueChange={(value) => setValues((v) => ({ ...v, learnerId: value }))} disabled={loading || learnersLoading}>
          <SelectTrigger id="learner">
            <SelectValue placeholder="Select a learner" />
          </SelectTrigger>
          <SelectContent>
            {learnersLoading ? (
              <div className="p-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              learners.map((learner) => (
                <SelectItem key={learner._id} value={learner._id}>
                  {learner.firstName} {learner.lastName} ({learner.email})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookingDate">Booking Date *</Label>
        <Input
          id="bookingDate"
          type="date"
          value={selectedBookingDate}
          onChange={(e) => setSelectedBookingDate(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="courseSlot">Time Slot *</Label>
        <Select value={values.courseSlotId} onValueChange={(value) => setValues((v) => ({ ...v, courseSlotId: value }))} disabled={loading || loadingSlots || !selectedCourseId || !selectedBookingDate}>
          <SelectTrigger id="courseSlot">
            <SelectValue placeholder={loadingSlots ? "Loading slots..." : !selectedCourseId || !selectedBookingDate ? "Select course and date first" : "Select a time slot"} />
          </SelectTrigger>
          <SelectContent>
            {loadingSlots ? (
              <div className="p-2">
                <Skeleton className="h-4 w-full" />
              </div>
            ) : slots.length === 0 ? (
              <div className="p-2 text-muted-foreground text-sm">No slots available for this date</div>
            ) : (
              slots.map((slot) => (
                <SelectItem key={slot.slotId} value={slot.slotId} disabled={!slot.isAvailable}>
                  {slot.startTime} - {slot.endTime} {slot.isAvailable ? "" : "(Booked)"}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookingStatus">Booking Status</Label>
        <Select value={values.bookingStatus} onValueChange={(value) => setValues((v) => ({ ...v, bookingStatus: value as Booking["bookingStatus"] }))} disabled={loading}>
          <SelectTrigger id="bookingStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentStatus">Payment Status</Label>
        <Select value={values.paymentStatus} onValueChange={(value) => setValues((v) => ({ ...v, paymentStatus: value as Booking["paymentStatus"] }))} disabled={loading}>
          <SelectTrigger id="paymentStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={values.amount || ""}
          onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value ? parseFloat(e.target.value) : undefined }))}
          disabled={loading}
          placeholder="Auto-filled from course price"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !values.courseId || !values.courseSlotId || !values.learnerId || !values.bookingDate}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
