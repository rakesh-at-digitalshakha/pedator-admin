"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useDeleteBanner } from "@/hooks/api/use-promotions";
import { formatDistanceToNow } from "date-fns";
import { Copy, Eye, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/media-url";

export type BannerRow = {
  id: string;
  title?: string;
  imageUrl?: string;
  position?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  clicks?: number;
  impressions?: number;
  cta?: string;
  createdAt?: string;
};

export function useBannerColumns(): ColumnDef<BannerRow, any>[] {
  const del = useDeleteBanner();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return [
    {
      accessorKey: "title",
      header: "Banner",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl && (
            <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
              <Image
                src={resolveMediaUrl(row.original.imageUrl)}
                alt={row.original.title || "Banner"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="font-medium">{row.original.title || `Banner ${row.original.id}`}</div>
            <div className="text-xs text-muted-foreground">{row.original.cta || "No CTA"}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          #{row.original.position || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "dates",
      header: "Schedule",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.startDate ? new Date(row.original.startDate).toLocaleDateString() : "N/A"}</div>
          <div className="text-xs text-muted-foreground">to {row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : "N/A"}</div>
        </div>
      ),
    },
    {
      id: "performance",
      header: "Performance",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.impressions || 0} impressions</div>
          <div className="text-xs text-muted-foreground">{row.original.clicks || 0} clicks</div>
        </div>
      ),
    },
    {
      id: "created",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.createdAt ? formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true }) : "N/A"}
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
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingId(row.original.id)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(resolveMediaUrl(row.original.imageUrl), "_blank")}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeletingId(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
