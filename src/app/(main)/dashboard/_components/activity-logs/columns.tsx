"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { LogsIcon, User, Clock, Shield } from "lucide-react";

export type ActivityLog = {
  id: string;
  action: string;
  actor: string;
  actorId?: string;
  target?: string;
  targetId?: string;
  details?: string;
  status?: string; // success | failed
  timestamp?: string;
  ipAddress?: string;
  userAgent?: string;
};

const ACTION_COLORS: Record<string, string> = {
  create: "default",
  read: "secondary",
  update: "default",
  delete: "destructive",
  approve: "default",
  reject: "destructive",
  suspend: "destructive",
  ban: "destructive",
  login: "secondary",
  logout: "secondary",
  export: "default",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: "✨",
  read: "👁️",
  update: "✏️",
  delete: "🗑️",
  approve: "✓",
  reject: "✗",
  suspend: "⏸️",
  ban: "🚫",
  login: "🔓",
  logout: "🔒",
  export: "📤",
};

export function useActivityLogColumns(): ColumnDef<ActivityLog, any>[] {
  return [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.original.action?.toLowerCase() || "unknown";
        const baseAction = action.split("_")[0];
        const color = ACTION_COLORS[baseAction] || "default";
        const icon = ACTION_ICONS[baseAction] || "•";
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <Badge variant={color as any}>
              {action.replace(/_/g, " ")}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "actor",
      header: "Performed By",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.actor}</div>
            <div className="text-xs text-muted-foreground">ID: {row.original.actorId}</div>
          </div>
        </div>
      ),
    },
    {
      id: "target",
      header: "Target",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.target || "System"}</div>
          {row.original.targetId && (
            <div className="text-xs text-muted-foreground">#{row.original.targetId}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "failed" ? "destructive" : "default"}>
          {row.original.status || "success"}
        </Badge>
      ),
    },
    {
      id: "timeline",
      header: "When",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {row.original.timestamp
            ? formatDistanceToNow(new Date(row.original.timestamp), { addSuffix: true })
            : "N/A"}
        </div>
      ),
    },
    {
      id: "ip",
      header: "IP Address",
      cell: ({ row }) => (
        <div className="text-xs font-mono">{row.original.ipAddress || "N/A"}</div>
      ),
    },
    {
      id: "details",
      header: "Details",
      cell: ({ row }) => (
        <div
          className="text-xs text-muted-foreground max-w-xs truncate"
          title={row.original.details || ""}
        >
          {row.original.details || "No details"}
        </div>
      ),
    },
  ];
}
