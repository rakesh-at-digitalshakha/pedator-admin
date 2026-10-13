"use client";

import * as React from "react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetReviewModeration } from "@/hooks/api";
import type { ReviewModerationFilters, ReviewModerationItem, ReviewPerson } from "@/types/api";

import { ReviewDecisionDialog, type ReviewDecisionTarget } from "./review-decision-dialog";

const personName = (person?: ReviewPerson | string) => {
  if (!person || typeof person === "string") return "Unknown";
  const name = `${person.firstName || ""} ${person.lastName || ""}`.trim();
  return name || person.email || "Unknown";
};

const courseTitle = (course?: ReviewModerationItem["courseId"]) => {
  if (!course || typeof course === "string") return "—";
  return course.title || "—";
};

const statusBadge = (status?: string) => {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "rejected") return <Badge variant="secondary">Rejected</Badge>;
  if (status === "pending") return <Badge variant="outline">Pending</Badge>;
  return null;
};

export function ReviewRequestsPanel() {
  const [filters, setFilters] = React.useState<ReviewModerationFilters>({
    type: "all",
    status: "pending",
  });
  const [decision, setDecision] = React.useState<ReviewDecisionTarget | null>(null);
  const { data, isLoading, error } = useGetReviewModeration(filters);
  const rows = data?.data ?? [];

  if (error) {
    return (
      <div className="text-destructive">
        {error instanceof Error ? error.message : "Could not load review requests"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Mentor reports hide a review after approval. Deletion requests remove it after approval.
        </p>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.type || "all"}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value as ReviewModerationFilters["type"] }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Request type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All requests</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
              <SelectItem value="deletion">Deletion requests</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status || "pending"}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value as ReviewModerationFilters["status"] }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
          No {filters.status} requests.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Learner</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Request</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const showReport = filters.type !== "deletion" && !!row.report?.status;
                const showDeletion = filters.type !== "report" && !!row.deletionRequest?.status;
                const reviewText = row.comment || row.reviewText || "No comment";
                return (
                  <TableRow key={row._id}>
                    <TableCell>
                      <div className="font-medium">{personName(row.mentorId)}</div>
                      <div className="text-muted-foreground text-xs">{courseTitle(row.courseId)}</div>
                    </TableCell>
                    <TableCell>{personName(row.learnerId)}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{reviewText}</div>
                      {row.isHidden ? (
                        <Badge variant="secondary" className="mt-1">
                          Hidden
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="space-y-2">
                      {showReport ? (
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium">Report</span>
                            {statusBadge(row.report?.status)}
                          </div>
                          <div className="text-muted-foreground max-w-xs text-xs">{row.report?.reason}</div>
                          {row.report?.requestedAt ? (
                            <div className="text-muted-foreground text-xs">
                              {format(new Date(row.report.requestedAt), "MMM d, yyyy")}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {showDeletion ? (
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium">Deletion</span>
                            {statusBadge(row.deletionRequest?.status)}
                          </div>
                          <div className="text-muted-foreground max-w-xs text-xs">{row.deletionRequest?.reason}</div>
                          {row.deletionRequest?.requestedAt ? (
                            <div className="text-muted-foreground text-xs">
                              {format(new Date(row.deletionRequest.requestedAt), "MMM d, yyyy")}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        {row.report?.status === "pending" && filters.type !== "deletion" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                setDecision({ reviewId: row._id, kind: "report", action: "approve" })
                              }
                            >
                              Approve report
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDecision({ reviewId: row._id, kind: "report", action: "reject" })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        ) : null}
                        {row.deletionRequest?.status === "pending" && filters.type !== "report" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setDecision({ reviewId: row._id, kind: "deletion", action: "approve" })
                              }
                            >
                              Approve deletion
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDecision({ reviewId: row._id, kind: "deletion", action: "reject" })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ReviewDecisionDialog target={decision} onClose={() => setDecision(null)} />
    </div>
  );
}
