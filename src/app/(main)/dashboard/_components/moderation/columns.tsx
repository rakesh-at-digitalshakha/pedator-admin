"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSuspendUser, useBanUser, useUnbanUser } from "@/hooks/api/use-moderation";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, AlertTriangle, Ban, Clock, CheckCircle } from "lucide-react";

export type FlaggedContent = {
  id: string;
  title: string;
  userId: string;
  reason?: string;
  status?: string; // flagged | reviewed | approved | rejected
  severity?: string; // low | medium | high | critical
  contentType?: string;
  createdAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

const SEVERITY_CONFIG = {
  low: { color: "secondary", icon: AlertTriangle },
  medium: { color: "default", icon: AlertTriangle },
  high: { color: "destructive", icon: AlertTriangle },
  critical: { color: "destructive", icon: Ban },
};

const STATUS_CONFIG = {
  flagged: { color: "outline", label: "Flagged", icon: AlertTriangle },
  reviewed: { color: "secondary", label: "Reviewed", icon: Clock },
  approved: { color: "default", label: "Approved", icon: CheckCircle },
  rejected: { color: "destructive", label: "Rejected", icon: Ban },
};

export function useModerationColumns(onReview?: (content: FlaggedContent) => void): ColumnDef<FlaggedContent, any>[] {
  const suspendMutation = useSuspendUser();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [banId, setBanId] = useState<string | null>(null);

  return [
    {
      accessorKey: "title",
      header: "Content",
      cell: ({ row }) => (
        <div>
          <div className="font-medium max-w-xs truncate">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">Type: {row.original.contentType || "Unknown"}</div>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium">{row.original.reason || "Not specified"}</div>
        </div>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const severity = row.original.severity || "medium";
        const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
        return (
          <Badge variant={config.color as any}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "flagged";
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        return (
          <Badge variant={config.color as any}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "timeline",
      header: "Flagged",
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
              <DropdownMenuItem onClick={() => onReview?.(row.original)}>
                <Shield className="w-4 h-4 mr-2" />
                Review Content
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSuspendId(row.original.userId)}>
                <Clock className="w-4 h-4 mr-2" />
                Suspend User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBanId(row.original.userId)} className="text-destructive">
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => unbanMutation.mutate({ id: row.original.userId })}>
                Unban User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={suspendId === row.original.userId} onOpenChange={(open) => !open && setSuspendId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Suspend User?</AlertDialogTitle>
                <AlertDialogDescription>
                  User {row.original.userId} will be suspended. They can still access their account but won't be able to perform actions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    suspendMutation.mutate({ id: row.original.userId, reason: row.original.reason });
                    setSuspendId(null);
                  }}
                >
                  Suspend
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={banId === row.original.userId} onOpenChange={(open) => !open && setBanId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ban User?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently ban user {row.original.userId}. They won't be able to access their account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    banMutation.mutate({ id: row.original.userId, reason: row.original.reason });
                    setBanId(null);
                  }}
                >
                  Ban User
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ),
    },
  ];
}
