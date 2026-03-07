"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Shield, AlertTriangle, Ban, Clock, CheckCircle, MoreHorizontal } from "lucide-react";

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

export interface ModerationColumnCallbacks {
  onReview:  (content: FlaggedContent) => void;
  onSuspend: (content: FlaggedContent) => void;
  onBan:     (content: FlaggedContent) => void;
  onUnban:   (content: FlaggedContent) => void;
}

/** Pure column definitions — no hooks, no dialogs. All mutations live in the table component. */
export function getModerationColumns(callbacks: ModerationColumnCallbacks): ColumnDef<FlaggedContent, any>[] {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => callbacks.onReview(row.original)}>
              <Shield className="w-4 h-4 mr-2" />
              Review Content
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => callbacks.onSuspend(row.original)}>
              <Clock className="w-4 h-4 mr-2" />
              Suspend User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => callbacks.onBan(row.original)}
              className="text-destructive"
            >
              <Ban className="w-4 h-4 mr-2" />
              Ban User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => callbacks.onUnban(row.original)}>
              Unban User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
