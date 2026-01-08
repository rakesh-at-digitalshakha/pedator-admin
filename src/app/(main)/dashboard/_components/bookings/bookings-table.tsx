"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { useGetAllBookings, useCreateBooking, useUpdateBooking } from "@/hooks/api";
import type { BookingFilters, Booking } from "@/types/api";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { bookingColumns } from "./booking-columns";
import { BookingForm, type BookingFormValues } from "./forms/booking-form";

export function BookingsTable() {
  const [filters, setFilters] = React.useState<BookingFilters>({
    page: 1,
    limit: 10,
    sortBy: "bookingDate",
    order: "desc",
  });
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);

  const createMutation = useCreateBooking();
  const updateMutation = useUpdateBooking();

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Search can be implemented in backend or client-side filtering
      // For now, we'll just update the filters
      setFilters((prev) => ({
        ...prev,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const { data: bookingsData, isLoading, error } = useGetAllBookings(filters);

  const bookings = bookingsData?.data?.data ?? [];

  const handleStatusChange = React.useCallback((value: string) => {
    setStatusFilter(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as BookingFilters["status"]),
      page: 1,
    }));
  }, []);

  const handlePaymentStatusChange = React.useCallback((value: string) => {
    setPaymentStatusFilter(value);
    // Note: Backend may not support paymentStatus filter yet
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = React.useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, limit: pageSize, page: 1 }));
  }, []);

  const handleCreate = React.useCallback(async (values: BookingFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Booking created successfully");
      setShowCreateDialog(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create booking");
    }
  }, [createMutation]);

  const handleEdit = React.useCallback((booking: Booking) => {
    setEditingBooking(booking);
  }, []);

  const handleUpdate = React.useCallback(async (values: BookingFormValues) => {
    if (!editingBooking) return;
    try {
      await updateMutation.mutateAsync({
        id: editingBooking._id,
        data: values,
      });
      toast.success("Booking updated successfully");
      setEditingBooking(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update booking");
    }
  }, [editingBooking, updateMutation]);

  const columns = React.useMemo(() => bookingColumns({ onEdit: handleEdit }), [handleEdit]);

  const table = useDataTableInstance({
    data: bookings,
    columns,
    getRowId: (row) => row._id,
    enableRowSelection: false,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const defaultFormValues: BookingFormValues = {
    courseId: "",
    courseSlotId: "",
    learnerId: "",
    bookingDate: "",
    bookingStatus: "pending",
    paymentStatus: "pending",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bookings</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 size-4" />
          Create Booking
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course, student, mentor..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentStatusFilter} onValueChange={handlePaymentStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchValue("");
            setStatusFilter("all");
            setPaymentStatusFilter("all");
            setFilters({ page: 1, limit: 10, sortBy: "bookingDate", order: "desc" });
          }}
        >
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
          <DataTable 
            columns={columns} 
            data={bookings} 
            isLoading={isLoading}
            table={table}
          />
          {bookingsData?.data && bookingsData.data.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1} to{" "}
                {Math.min((filters.page ?? 1) * (filters.limit ?? 10), bookingsData.data.total ?? 0)} of{" "}
                {bookingsData.data.total ?? 0} bookings
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
                  Page {filters.page ?? 1} of {bookingsData?.data?.pages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(bookingsData?.data?.pages ?? 1, (filters.page ?? 1) + 1))}
                  disabled={(filters.page ?? 1) >= (bookingsData?.data?.pages ?? 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Booking</DialogTitle>
            <DialogDescription>Create a new booking for a course.</DialogDescription>
          </DialogHeader>
          <BookingForm
            initialValues={defaultFormValues}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>Update booking details.</DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <BookingForm
              initialValues={{
                courseId: editingBooking.courseId._id,
                courseSlotId: editingBooking.courseSlotId._id,
                learnerId: editingBooking.learnerId._id,
                bookingDate: editingBooking.bookingDate,
                bookingStatus: editingBooking.bookingStatus,
                paymentStatus: editingBooking.paymentStatus,
                amount: editingBooking.amount,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingBooking(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
