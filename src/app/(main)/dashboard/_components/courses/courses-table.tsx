"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useGetAllCourses, useGetAllCategories } from "@/hooks/api";
import type { CourseFilters } from "@/types/api";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { courseColumns } from "./course-columns";

export function CoursesTable() {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 10,
  });

  const { data: coursesData, isLoading, error } = useGetAllCourses(filters);
  const { data: categoriesData } = useGetAllCategories();

  if (error) {
    toast.error("Failed to load courses");
  }

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as "approved" | "pending" | "rejected"),
      page: 1,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search courses..."
          className="max-w-sm"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Select onValueChange={handleStatusChange} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleCategoryChange} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoriesData?.data?.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                page: 1,
                limit: 10,
              })
            }
          >
            Reset Filters
          </Button>
        </div>
      </div>

      <DataTable
        columns={courseColumns}
        data={coursesData?.data || []}
        isLoading={isLoading}
        pageCount={coursesData?.pages || 1}
      />
    </div>
  );
}
