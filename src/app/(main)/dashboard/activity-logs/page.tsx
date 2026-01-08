"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityLogs, useLoginHistory } from "@/hooks/api/use-activity-logs";

export default function ActivityLogsPage() {
  const logs = useActivityLogs();
  const logins = useLoginHistory();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs">{JSON.stringify(logs.data ?? {}, null, 2)}</pre>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs">{JSON.stringify(logins.data ?? {}, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
