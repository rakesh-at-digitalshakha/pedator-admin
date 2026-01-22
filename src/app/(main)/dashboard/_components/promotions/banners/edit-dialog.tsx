"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateBanner } from "@/hooks/api/use-promotions";
import { toast } from "sonner";
import { BannerRow } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Valid image URL required"),
  position: z.number().int().positive("Position must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  cta: z.string().optional(),
  ctaUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface EditDialogProps {
  banner: BannerRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BannerEditDialog({ banner, open, onOpenChange }: EditDialogProps) {
  const updateMutation = useUpdateBanner();
  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: banner ? {
      title: banner.title || "",
      imageUrl: banner.imageUrl || "",
      position: banner.position || 1,
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
      cta: banner.cta || "",
      ctaUrl: "",
      isActive: banner.isActive !== false,
      description: "",
    } : undefined,
  });

  const onSubmit = async (data: BannerFormData) => {
    if (!banner) return;
    try {
      await updateMutation.mutateAsync({
        id: banner.id,
        data: {
          ...data,
          ctaUrl: data.ctaUrl || null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to update banner");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Banner title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Position</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <div className="relative w-full h-40 rounded overflow-hidden bg-muted mt-2">
                      <Image
                        src={field.value}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Learn More" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ctaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Banner description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Active Banner</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Banner"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
