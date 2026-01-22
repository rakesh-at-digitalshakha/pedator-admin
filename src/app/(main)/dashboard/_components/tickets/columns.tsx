"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAssignTicket, useUpdateTicketStatus } from "@/hooks/api/use-tickets";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, Clock, AlertCircle, Trash2, Edit } from "lucide-react";

export type TicketRow = {
  id: string;
  subject: string;
  category?: string;
  status: string; // open | assigned | resolved
  priority?: string; // low | medium | high | urgent
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: string;
  userId?: string;
  description?: string;
};

const PRIORITY_CONFIG = {
  low: { color: "secondary", icon: AlertCircle },
  medium: { color: "default", icon: Clock },
  high: { color: "destructive", icon: AlertCircle },
  urgent: { color: "destructive", icon: AlertCircle },
};

const STATUS_CONFIG = {
  open: { color: "outline", label: "Open", icon: AlertCircle },
  assigned: { color: "secondary", label: "Assigned", icon: Clock },
  resolved: { color: "default", label: "Resolved", icon: CheckCircle },
  closed: { color: "secondary", label: "Closed", icon: CheckCircle },
};

export function useTicketColumns(onEdit?: (ticket: TicketRow) => void): ColumnDef<TicketRow, any>[] {
  const assignMutation = useAssignTicket();
  const statusMutation = useUpdateTicketStatus();
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return [
    {
      accessorKey: "subject",
      header: "Ticket",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.subject}</div>
          <div className="text-xs text-muted-foreground">#{row.original.id}</div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.category || "General"}</Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority || "medium";
        const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
        return (
          <Badge variant={config.color as any}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "open";
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        return (
          <Badge variant={config.color as any}>
            {config.icon && <span className="mr-1">•</span>}
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "assignee",
      header: "Assigned To",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.assignedTo ? (
            <Badge variant="secondary">{row.original.assignedTo}</Badge>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      id: "timeline",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {row.original.createdAt
            ? formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })
            : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
                <Edit className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!row.original.assignedTo && (
                <DropdownMenuItem onClick={() => assignMutation.mutate({ id: row.original.id, adminId: "me" })}>
                  📌 Assign to me
                </DropdownMenuItem>
              )}
              {row.original.status !== "resolved" && (
                <DropdownMenuItem onClick={() => setResolveId(row.original.id)}>
                  ✓ Mark Resolved
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteId(row.original.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={resolveId === row.original.id} onOpenChange={(open) => !open && setResolveId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resolve Ticket?</AlertDialogTitle>
                <AlertDialogDescription>
                  Mark "{row.original.subject}" as resolved. This action can be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    statusMutation.mutate({ id: row.original.id, status: "resolved" });
                    setResolveId(null);
                  }}
                >
                  Resolve
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteId === row.original.id} onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Ticket?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the ticket "{row.original.subject}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => setDeleteId(null)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ),
    },
  ];
}
