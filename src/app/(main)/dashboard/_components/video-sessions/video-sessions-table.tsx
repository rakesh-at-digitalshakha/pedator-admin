"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllVideoSessions, useGetAllMentors, useGetAllLearners } from "@/hooks/api";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import type { VideoSessionFilters } from "@/types/api";

import { videoSessionColumns } from "./video-session-columns";

export function VideoSessionsTable() {
  const [filters, setFilters] = React.useState<VideoSessionFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [mentorFilter, setMentorFilter] = React.useState<string>("all");
  const [learnerFilter, setLearnerFilter] = React.useState<string>("all");

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

  const { data: sessionsData, isLoading, error } = useGetAllVideoSessions(filters);
  
  // Fetch mentors and learners for filters
  const { data: mentorsData } = useGetAllMentors({ limit: 1000 });
  const { data: learnersData } = useGetAllLearners({ limit: 1000 });

  const mentors = (mentorsData?.data as any[]) ?? [];
  const learners = (learnersData?.data as any[]) ?? [];
  const sessions = sessionsData?.data ?? [];

  const handleStatusChange = React.useCallback((value: string) => {
    setStatusFilter(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as VideoSessionFilters["status"]),
      page: 1,
    }));
  }, []);

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

  const handleSortChange = React.useCallback((sortBy: string, order: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as VideoSessionFilters["sortBy"],
      order: order as "asc" | "desc",
    }));
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearchValue("");
    setStatusFilter("all");
    setMentorFilter("all");
    setLearnerFilter("all");
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    });
  }, []);

  const columns = React.useMemo(() => videoSessionColumns, []);

  const table = useDataTableInstance({
    data: sessions,
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
            placeholder="Search by room ID or transaction ID..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending/Scheduled</SelectItem>
            <SelectItem value="active">Active/Ongoing</SelectItem>
            <SelectItem value="ended">Ended/Completed</SelectItem>
            <SelectItem value="failed">Failed/Cancelled</SelectItem>
          </SelectContent>
        </Select>
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
            <SelectItem value="startTime-desc">Start Time (Latest)</SelectItem>
            <SelectItem value="startTime-asc">Start Time (Earliest)</SelectItem>
            <SelectItem value="duration-desc">Duration (Longest)</SelectItem>
            <SelectItem value="duration-asc">Duration (Shortest)</SelectItem>
            <SelectItem value="status-asc">Status (A-Z)</SelectItem>
            <SelectItem value="status-desc">Status (Z-A)</SelectItem>
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
          {sessionsData && sessionsData.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to{" "}
                {Math.min((filters.page ?? 1) * (filters.limit ?? 10), sessionsData.total ?? 0)} of{" "}
                {sessionsData.total ?? 0} sessions
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
                  Page {filters.page ?? 1} of {sessionsData.pages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(sessionsData.pages ?? 1, (filters.page ?? 1) + 1))}
                  disabled={(filters.page ?? 1) >= (sessionsData.pages ?? 1)}
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
