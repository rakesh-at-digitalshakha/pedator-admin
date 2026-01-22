"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useDeleteCoupon } from "@/hooks/api/use-promotions";
import { toast } from "sonner";
import CouponEditDialog from "./edit-dialog";

export interface CouponRow {
  id: string;
  code: string;
  discount: number;
  discountType?: "percentage" | "fixed";
  maxUsage?: number;
  usedCount?: number;
  expiresAt?: string;
  isActive?: boolean;
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  createdAt?: string;
}

export function useCouponColumns() {
  const deleteCoupon = useDeleteCoupon();
  const [editingId, setEditingId] = useState<string | null>(null);

  const columns: ColumnDef<CouponRow>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        return (
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-muted rounded font-mono text-sm font-semibold">
              {code}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success("Code copied!");
              }}
              title="Copy code"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => {
        const coupon = row.original;
        const discountType = coupon.discountType || "percentage";
        const discount = row.getValue("discount") as number;
        return (
          <div className="font-semibold flex items-center gap-1">
            {discount}
            <span className="text-xs text-muted-foreground">
              {discountType === "percentage" ? "%" : "₹"}
            </span>
            {coupon.maxDiscount && discountType === "percentage" && (
              <span className="text-xs text-muted-foreground ml-1">
                (Max: ₹{coupon.maxDiscount})
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "usedCount",
      header: "Usage",
      cell: ({ row }) => {
        const coupon = row.original;
        const usedCount = coupon.usedCount || 0;
        const maxUsage = coupon.maxUsage;
        const percentage = maxUsage ? Math.round((usedCount / maxUsage) * 100) : 0;
        
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {usedCount}{maxUsage ? `/${maxUsage}` : ""}
            </span>
            {maxUsage && (
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "minOrderValue",
      header: "Min Order",
      cell: ({ row }) => {
        const minOrder = row.original.minOrderValue;
        return minOrder ? <span>₹{minOrder}</span> : <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => {
        const expiresAt = row.getValue("expiresAt") as string;
        if (!expiresAt) return <span className="text-muted-foreground text-sm">No expiry</span>;
        
        const expireDate = new Date(expiresAt);
        const isExpired = expireDate < new Date();
        const daysLeft = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="flex flex-col gap-1">
            <span className={isExpired ? "text-red-600 text-sm font-medium" : "text-sm"}>
              {format(expireDate, "MMM dd")}
            </span>
            {daysLeft > 0 && !isExpired && (
              <span className="text-xs text-muted-foreground">{daysLeft}d left</span>
            )}
            {isExpired && <Badge variant="destructive" className="w-fit">Expired</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive ?? true;
        return (
          <Badge variant={isActive ? "default" : "secondary"} className="w-fit">
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => setEditingId(coupon.id)}
                  className="cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  <span>Edit Coupon</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this coupon?")) {
                      deleteCoupon.mutate(coupon.id);
                    }
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {editingId === coupon.id && (
              <CouponEditDialog
                coupon={coupon}
                open={editingId === coupon.id}
                onOpenChange={(open) => !open && setEditingId(null)}
              />
            )}
          </>
        );
      },
    },
  ];

  return columns;
}
