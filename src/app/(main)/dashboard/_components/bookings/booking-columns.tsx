"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useUpdateBookingStatus } from "@/hooks/api";
import type { Booking } from "@/types/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

const statusColors = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  completed: "default",
  cancelled: "destructive",
  missed: "destructive",
} as const;

type BookingColumnsProps = {
  onEdit?: (booking: Booking) => void;
};

export const bookingColumns = ({ onEdit }: BookingColumnsProps = {}): ColumnDef<Booking>[] => [
  {
    accessorKey: "courseId.title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
    cell: ({ row }) => {
      const booking = row.original;
      const coursePrice = booking.courseId.price ?? booking.amount ?? booking.razorpayDetails?.amount ?? 0;
      return (
        <div className="flex max-w-xs flex-col">
          <span className="truncate font-medium">{booking.courseId.title}</span>
          <span className="text-muted-foreground text-xs">
            Course Price: ₹{coursePrice.toFixed(2)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "learnerId",
    header: "Student",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {booking.learnerId.firstName} {booking.learnerId.lastName}
          </span>
          {booking.learnerId.email && (
            <span className="text-muted-foreground text-xs">{booking.learnerId.email}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "mentorId",
    header: "Mentor",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {booking.mentorId.firstName} {booking.mentorId.lastName}
          </span>
          {booking.mentorId.email && (
            <span className="text-muted-foreground text-xs">{booking.mentorId.email}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "bookingDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Booking Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("bookingDate"));
      return <span className="text-sm">{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "courseSlotId",
    header: "Slot Time",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <div className="text-sm">
          <div>{new Date(booking.courseSlotId.slotDate).toLocaleDateString()}</div>
          <div className="text-muted-foreground text-xs">
            {booking.courseSlotId.startTime} - {booking.courseSlotId.endTime}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "bookingStatus",
    header: "Status",
    cell: ({ row }) => {
      const booking = row.original;
      const status = row.getValue("bookingStatus") as Booking["bookingStatus"];
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={statusColors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
          {booking.isRescheduled && (
            <Badge variant="outline" className="text-xs">Rescheduled</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const booking = row.original;
      const amount = booking.amount ?? booking.razorpayDetails?.amount ?? booking.courseId.price ?? 0;
      return (
        <div className="flex flex-col">
          <span className="font-medium">₹{amount.toFixed(2)}</span>
          {booking.razorpayDetails?.amount && booking.razorpayDetails.amount !== amount && (
            <span className="text-muted-foreground text-xs">
              Paid: ₹{booking.razorpayDetails.amount.toFixed(2)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const booking = row.original;
      const status = row.getValue("paymentStatus") as string;
      const variant = status === "completed" ? "default" : status === "failed" || status === "refunded" ? "destructive" : "secondary";
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={variant}>{status}</Badge>
          {booking.razorpayDetails?.paymentId && (
            <span className="text-muted-foreground text-xs truncate max-w-[120px]" title={booking.razorpayDetails.paymentId}>
              Payment ID: {booking.razorpayDetails.paymentId.slice(-8)}
            </span>
          )}
          {booking.razorpayDetails?.orderId && (
            <span className="text-muted-foreground text-xs truncate max-w-[120px]" title={booking.razorpayDetails.orderId}>
              Order ID: {booking.razorpayDetails.orderId.slice(-8)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const booking = row.original;
      const updateMutation = useUpdateBookingStatus();
      const [showUpdateDialog, setShowUpdateDialog] = useState(false);
      const [newStatus, setNewStatus] = useState<Booking["bookingStatus"]>(booking.bookingStatus);
      const [reason, setReason] = useState("");

      const handleUpdateStatus = async () => {
        try {
          await updateMutation.mutateAsync({
            id: booking._id,
            bookingStatus: newStatus,
            reason: reason || undefined,
          });
          toast.success("Booking status updated");
          setShowUpdateDialog(false);
        } catch (error) {
          toast.error("Failed to update booking status");
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(booking._id)}>
                Copy booking ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(booking)}>Edit booking</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowUpdateDialog(true)}>Update status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Booking Status</DialogTitle>
                <DialogDescription>Change the status of this booking.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Booking["bookingStatus"])}>
                    <SelectTrigger>
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
                <div>
                  <label className="text-sm font-medium">Reason (Optional)</label>
                  <Textarea
                    placeholder="Enter reason for status change..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
