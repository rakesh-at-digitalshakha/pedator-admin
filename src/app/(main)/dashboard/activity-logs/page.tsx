"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityLogs, useLoginHistory } from "@/hooks/api/use-activity-logs";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { toast } from "sonner";

function JsonViewer({ data }: { data: any }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!data) {
    return <p className="text-muted-foreground text-sm">No data available</p>;
  }

  const isArray = Array.isArray(data);
  const items = isArray ? data : [data];

  const copyToClipboard = (json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No records found</p>
      ) : (
        items.map((item: any, idx: number) => (
          <div key={idx} className="border rounded-lg p-3 bg-accent/50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                onClick={() => setExpanded({ ...expanded, [idx]: !expanded[idx] })}
                className="flex items-center gap-1 hover:text-foreground text-muted-foreground"
              >
                {expanded[idx] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-xs font-medium">Entry {idx + 1}</span>
              </button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(item)}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>

            {expanded[idx] && (
              <div className="mt-3 space-y-2 text-xs">
                {typeof item === "object" && item !== null ? (
                  Object.entries(item).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="font-mono text-blue-600 dark:text-blue-400 min-w-fit">{key}:</span>
                      <span className="text-foreground break-all">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default function ActivityLogsPage() {
  const logs = useActivityLogs();
  const logins = useLoginHistory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground mt-2">Monitor audit trail and login history</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Trail</CardTitle>
              {logs.isLoading && <Skeleton className="h-4 w-12" />}
              {!logs.isLoading && (
                <Badge variant="outline">
                  {Array.isArray(logs.data) ? logs.data.length : logs.data?.data?.length ?? 0} records
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {logs.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : logs.error ? (
              <p className="text-destructive text-sm">Failed to load audit trail</p>
            ) : (
              <JsonViewer data={logs.data?.data ?? logs.data} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Login History</CardTitle>
              {logins.isLoading && <Skeleton className="h-4 w-12" />}
              {!logins.isLoading && (
                <Badge variant="outline">
                  {Array.isArray(logins.data) ? logins.data.length : logins.data?.data?.length ?? 0} records
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {logins.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : logins.error ? (
              <p className="text-destructive text-sm">Failed to load login history</p>
            ) : (
              <JsonViewer data={logins.data?.data ?? logins.data} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
