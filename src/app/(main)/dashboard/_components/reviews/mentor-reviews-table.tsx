"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMentorReviews, useGetAllMentors, useGetAllLearners, useGetAllCourses } from "@/hooks/api";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import type { MentorReviewFilters } from "@/types/api";

import { mentorReviewColumns } from "./mentor-review-columns";

export function MentorReviewsTable() {
  const [filters, setFilters] = React.useState<MentorReviewFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [mentorFilter, setMentorFilter] = React.useState<string>("all");
  const [learnerFilter, setLearnerFilter] = React.useState<string>("all");
  const [courseFilter, setCourseFilter] = React.useState<string>("all");

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchValue || undefined,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const { data: reviewsData, isLoading, error } = useGetMentorReviews(filters);
  
  // Fetch mentors, learners, and courses for filters
  const { data: mentorsData } = useGetAllMentors({ limit: 1000 });
  const { data: learnersData } = useGetAllLearners({ limit: 1000 });
  const { data: coursesData } = useGetAllCourses({ limit: 1000 });

  const mentors = (mentorsData?.data as any[]) ?? [];
  const learners = (learnersData?.data as any[]) ?? [];
  const courses = coursesData?.data?.data ?? [];

  const reviews = reviewsData?.data ?? [];

  const handleMentorChange = React.useCallback((value: string) => {
    setMentorFilter(value);
    setFilters((prev) => ({
      ...prev,
      mentorId: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleLearnerChange = React.useCallback((value: string) => {
    setLearnerFilter(value);
    setFilters((prev) => ({
      ...prev,
      learnerId: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleCourseChange = React.useCallback((value: string) => {
    setCourseFilter(value);
    setFilters((prev) => ({
      ...prev,
      courseId: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleSortChange = React.useCallback((sortBy: string, order: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as MentorReviewFilters["sortBy"],
      order: order as "asc" | "desc",
    }));
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearchValue("");
    setMentorFilter("all");
    setLearnerFilter("all");
    setCourseFilter("all");
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    });
  }, []);

  const columns = React.useMemo(() => mentorReviewColumns(), []);

  const table = useDataTableInstance({
    data: reviews,
    columns,
    getRowId: (row) => row._id,
    enableRowSelection: false,
  });

  if (error) {
    return (
      <div className="text-destructive">
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={mentorFilter} onValueChange={handleMentorChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by mentor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Mentors</SelectItem>
            {mentors.map((mentor) => (
              <SelectItem key={mentor._id} value={mentor._id}>
                {mentor.firstName} {mentor.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={learnerFilter} onValueChange={handleLearnerChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by learner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Learners</SelectItem>
            {learners.map((learner) => (
              <SelectItem key={learner._id} value={learner._id}>
                {learner.firstName} {learner.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={handleCourseChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={`${filters.sortBy || "createdAt"}-${filters.order || "desc"}`}
          onValueChange={(value) => {
            const [sortBy, order] = value.split("-");
            handleSortChange(sortBy, order);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Date (Newest)</SelectItem>
            <SelectItem value="createdAt-asc">Date (Oldest)</SelectItem>
            <SelectItem value="averageRating-desc">Rating (High to Low)</SelectItem>
            <SelectItem value="averageRating-asc">Rating (Low to High)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <DataTable table={table} columns={columns} isLoading={isLoading} />
          {reviewsData && reviewsData.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to{" "}
                {Math.min((filters.page ?? 1) * (filters.limit ?? 10), reviewsData.total ?? 0)} of{" "}
                {reviewsData.total ?? 0} reviews
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, (filters.page ?? 1) - 1))}
                  disabled={(filters.page ?? 1) <= 1}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page {filters.page ?? 1} of {reviewsData.pages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(reviewsData.pages ?? 1, (filters.page ?? 1) + 1))}
                  disabled={(filters.page ?? 1) >= (reviewsData.pages ?? 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
