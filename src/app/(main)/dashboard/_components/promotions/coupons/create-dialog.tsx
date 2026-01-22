"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateCoupon } from "@/hooks/api/use-promotions";
import { toast } from "sonner";

const createCouponSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
  discount: z.coerce.number().positive("Discount must be positive"),
  discountType: z.enum(["percentage", "fixed"]),
  maxUsage: z.coerce.number().optional().or(z.literal("")),
  minOrderValue: z.coerce.number().optional().or(z.literal("")),
  maxDiscount: z.coerce.number().optional().or(z.literal("")),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

type CreateCouponFormValues = z.infer<typeof createCouponSchema>;

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCouponDialog({
  open,
  onOpenChange,
}: CreateCouponDialogProps) {
  const createCoupon = useCreateCoupon();
  const isLoading = createCoupon.isPending;

  const form = useForm<CreateCouponFormValues>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: {
      code: "",
      discount: 0,
      discountType: "percentage",
      maxUsage: undefined,
      minOrderValue: undefined,
      maxDiscount: undefined,
      expiresAt: "",
      isActive: true,
      description: "",
    },
  });

  async function onSubmit(values: CreateCouponFormValues) {
    try {
      await createCoupon.mutateAsync({
        ...values,
        maxUsage: values.maxUsage || undefined,
        minOrderValue: values.minOrderValue || undefined,
        maxDiscount: values.maxDiscount || undefined,
      });
      toast.success("Coupon created successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create coupon");
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogDescription>
            Create a new promotional coupon for your courses
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., SUMMER20"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be unique and uppercase
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type *</FormLabel>
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
                    <FormLabel>Discount Value *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
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
                      <Input
                        {...field}
                        type="number"
                        placeholder="No limit"
                        min="0"
                        step="0.01"
                      />
                    </FormControl>
                    <FormDescription>
                      For percentage discounts only
                    </FormDescription>
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
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
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
                      <Input
                        {...field}
                        type="number"
                        placeholder="Leave empty for unlimited"
                        min="0"
                      />
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
                    <FormDescription>
                      Leave empty for no expiry
                    </FormDescription>
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
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Enable immediately
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                    <Textarea
                      {...field}
                      placeholder="e.g., Summer sale coupon valid on all courses"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
