"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFaq, useDeleteFaq, useGetFaqs, useUpdateFaq } from "@/hooks/api";
import { usePermissions } from "@/hooks/use-permissions";
import type { Faq, FaqAudience, FaqRequest } from "@/types/api";

const emptyForm = (): FaqRequest => ({
  question: "",
  answer: "",
  audience: "mentor",
  order: 0,
  isActive: true,
});

export function FaqsPanel() {
  const { data, isLoading, error } = useGetFaqs();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState<FaqRequest>(emptyForm());

  const { can } = usePermissions();
  const canCreate = can("faqs", "create");
  const canUpdate = can("faqs", "update");
  const canDelete = can("faqs", "delete");
  const faqs = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), order: faqs.length + 1 });
    setOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      audience: faq.audience,
      order: faq.order,
      isActive: faq.isActive,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    try {
      if (editing) {
        await updateFaq.mutateAsync({ id: editing._id, data: form });
        toast.success("FAQ updated");
      } else {
        await createFaq.mutateAsync(form);
        toast.success("FAQ created");
      }
      setOpen(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Could not save FAQ";
      toast.error(message);
    }
  };

  const remove = async (faq: Faq) => {
    if (!confirm(`Delete “${faq.question}”?`)) return;
    try {
      await deleteFaq.mutateAsync(faq._id);
      toast.success("FAQ deleted");
    } catch {
      toast.error("Could not delete FAQ");
    }
  };

  if (error) {
    return <div className="text-destructive">Could not load FAQs</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Mentor FAQs</CardTitle>
          <CardDescription>These questions appear in the mentor app FAQ screen.</CardDescription>
        </div>
        <Button onClick={openCreate} disabled={!canCreate}>
          <Plus className="mr-2 size-4" />
          Add FAQ
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No FAQs yet. Add the first question for the mentor app.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq._id}>
                  <TableCell>{faq.order}</TableCell>
                  <TableCell className="max-w-[220px] font-medium">{faq.question}</TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">{faq.answer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{faq.audience}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={faq.isActive ? "default" : "secondary"}>
                      {faq.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canUpdate ? (
                      <Button variant="ghost" size="icon" onClick={() => openEdit(faq)}>
                        <Pencil className="size-4" />
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button variant="ghost" size="icon" onClick={() => remove(faq)}>
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                placeholder="How to setup payment?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                rows={4}
                value={form.answer}
                onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
                placeholder="Add your bank account, then request a withdrawal."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={form.audience}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, audience: value as FaqAudience }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="faq-order">Order</Label>
                <Input
                  id="faq-order"
                  type="number"
                  value={form.order ?? 0}
                  onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="faq-active">Show in the app</Label>
              <Switch
                id="faq-active"
                checked={form.isActive !== false}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={createFaq.isPending || updateFaq.isPending}>
              {createFaq.isPending || updateFaq.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
