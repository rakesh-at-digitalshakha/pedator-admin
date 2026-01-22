"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateCoupon } from "@/hooks/api/use-promotions";
import { toast } from "sonner";
import { CouponRow } from "./columns";

const couponSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  discount: z.coerce.number().positive("Discount must be positive"),
  discountType: z.enum(["percentage", "fixed"]),
  maxUsage: z.coerce.number().optional(),
  minOrderValue: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponEditDialogProps {
  coupon: CouponRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CouponEditDialog({ coupon, open, onOpenChange }: CouponEditDialogProps) {
  const updateCoupon = useUpdateCoupon();
  const isLoading = updateCoupon.isPending;

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType || "percentage",
      maxUsage: coupon.maxUsage,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
      isActive: coupon.isActive ?? true,
      description: coupon.description,
    },
  });

  async function onSubmit(values: CouponFormValues) {
    try {
      await updateCoupon.mutateAsync({
        id: coupon.id,
        data: values,
      });
      toast.success("Coupon updated successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to update coupon");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., SUMMER20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0" min="0" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Discount Cap (₹)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="No limit" min="0" step="0.01" />
                    </FormControl>
                    <FormDescription>Only for percentage discounts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Value (₹)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0" min="0" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Usage</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Unlimited" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>Disable to prevent usage</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="e.g., Summer sale coupon valid on all courses" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
