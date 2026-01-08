"use client";

import * as React from "react";
import { Search, Calendar } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useGetAllTransactions, useGetAllMentors, useGetAllLearners } from "@/hooks/api";
import type { TransactionFilters } from "@/types/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { transactionColumns } from "./transaction-columns";

export function TransactionsTable() {
  const [filters, setFilters] = React.useState<TransactionFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [userModelFilter, setUserModelFilter] = React.useState<string>("all");
  const [userIdFilter, setUserIdFilter] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

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

  // Update filters when date range changes
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      page: 1,
    }));
  }, [startDate, endDate]);

  const { data: transactionsData, isLoading, error } = useGetAllTransactions(filters);
  
  // Fetch mentors and learners for filters
  const { data: mentorsData } = useGetAllMentors({ limit: 1000 });
  const { data: learnersData } = useGetAllLearners({ limit: 1000 });

  const mentors = (mentorsData?.data as any[]) ?? [];
  const learners = (learnersData?.data as any[]) ?? [];
  const transactions = transactionsData?.data ?? [];

  const handleTypeChange = React.useCallback((value: string) => {
    setTypeFilter(value);
    setFilters((prev) => ({
      ...prev,
      type: value === "all" ? undefined : (value as TransactionFilters["type"]),
      page: 1,
    }));
  }, []);

  const handleStatusChange = React.useCallback((value: string) => {
    setStatusFilter(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as TransactionFilters["status"]),
      page: 1,
    }));
  }, []);

  const handleUserModelChange = React.useCallback((value: string) => {
    setUserModelFilter(value);
    setUserIdFilter("all"); // Reset user filter when user model changes
    setFilters((prev) => ({
      ...prev,
      userModel: value === "all" ? undefined : (value as TransactionFilters["userModel"]),
      userId: undefined,
      page: 1,
    }));
  }, []);

  const handleUserIdChange = React.useCallback((value: string) => {
    setUserIdFilter(value);
    setFilters((prev) => ({
      ...prev,
      userId: value === "all" ? undefined : value,
      page: 1,
    }));
  }, [userModelFilter]);

  const handleSortChange = React.useCallback((sortBy: string, order: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as TransactionFilters["sortBy"],
      order: order as "asc" | "desc",
    }));
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearchValue("");
    setTypeFilter("all");
    setStatusFilter("all");
    setUserModelFilter("all");
    setUserIdFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    });
  }, []);

  // Get users based on selected userModel
  const usersForFilter = React.useMemo(() => {
    if (userModelFilter === "mentors") return mentors;
    if (userModelFilter === "learners") return learners;
    return [];
  }, [userModelFilter, mentors, learners]);

  const columns = React.useMemo(() => transactionColumns, []);

  const table = useDataTableInstance({
    data: transactions,
    columns,
    getRowId: (row) => row._id,
    enableRowSelection: false,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load transactions"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {transactionsData?.total ?? 0} total transaction{(transactionsData?.total ?? 0) !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description or ID..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="mentor_earning">Mentor Earning</SelectItem>
              <SelectItem value="platform_fee">Platform Fee</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={userModelFilter} onValueChange={handleUserModelChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="learners">Learners</SelectItem>
              <SelectItem value="mentors">Mentors</SelectItem>
              <SelectItem value="adminusers">Admins</SelectItem>
            </SelectContent>
          </Select>
          {userModelFilter !== "all" && usersForFilter.length > 0 && (
            <Select value={userIdFilter} onValueChange={handleUserIdChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={`Select ${userModelFilter}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {userModelFilter}</SelectItem>
                {usersForFilter.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {startDate && endDate ? (
                  `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
                ) : startDate ? (
                  format(startDate, "MMM d, yyyy")
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                  />
                </div>
                {(startDate || endDate) && (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>
                    Clear Dates
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
              <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
              <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
              <SelectItem value="type-asc">Type (A-Z)</SelectItem>
              <SelectItem value="type-desc">Type (Z-A)</SelectItem>
              <SelectItem value="status-asc">Status (A-Z)</SelectItem>
              <SelectItem value="status-desc">Status (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <DataTable table={table} columns={columns} isLoading={isLoading} />
            {transactionsData && transactionsData.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-muted-foreground text-sm">
                  Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to{" "}
                  {Math.min((filters.page ?? 1) * (filters.limit ?? 10), transactionsData.total ?? 0)} of{" "}
                  {transactionsData.total ?? 0} transactions
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
                    Page {filters.page ?? 1} of {transactionsData.pages ?? 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(transactionsData.pages ?? 1, (filters.page ?? 1) + 1))}
                    disabled={(filters.page ?? 1) >= (transactionsData.pages ?? 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
