"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDecideReviewDeletion, useDecideReviewReport } from "@/hooks/api";

export type ReviewDecisionTarget = {
  reviewId: string;
  kind: "report" | "deletion";
  action: "approve" | "reject";
};

const copyFor = (target: ReviewDecisionTarget) => {
  if (target.kind === "report" && target.action === "approve") {
    return {
      title: "Approve report",
      description: "This hides the review from learners and removes it from public ratings.",
    };
  }
  if (target.kind === "deletion" && target.action === "approve") {
    return {
      title: "Approve deletion",
      description: "This permanently deletes the review and recalculates the course and mentor rating.",
    };
  }
  return {
    title: "Reject request",
    description: "The review stays visible. The mentor can send a new request later.",
  };
};

export function ReviewDecisionDialog({
  target,
  onClose,
}: {
  target: ReviewDecisionTarget | null;
  onClose: () => void;
}) {
  const [note, setNote] = React.useState("");
  const reportMutation = useDecideReviewReport();
  const deletionMutation = useDecideReviewDeletion();
  const pending = reportMutation.isPending || deletionMutation.isPending;

  React.useEffect(() => {
    if (target) setNote("");
  }, [target]);

  const confirm = async () => {
    if (!target) return;
    const payload = { reviewId: target.reviewId, action: target.action, note: note.trim() || undefined };
    try {
      const result =
        target.kind === "report"
          ? await reportMutation.mutateAsync(payload)
          : await deletionMutation.mutateAsync(payload);
      toast.success(result.message || "Decision saved");
      onClose();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not save this decision";
      toast.error(message);
    }
  };

  const copy = target ? copyFor(target) : null;

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy?.title}</DialogTitle>
          <DialogDescription>{copy?.description}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note for the mentor"
          rows={3}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={target?.action === "approve" ? "default" : "destructive"}
            onClick={confirm}
            disabled={pending}
          >
            {pending ? "Saving..." : target?.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
