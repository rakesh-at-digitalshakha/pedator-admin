"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useBulkImportUsers,
  useBulkExportUsers,
  useBulkSendNotifications,
  useBulkApproveCourses,
  useBulkApproveMentors,
} from "@/hooks/api/use-bulk";

export default function BulkOpsPage() {
  const importUsers = useBulkImportUsers();
  const exportUsers = useBulkExportUsers();
  const sendNotifications = useBulkSendNotifications();
  const approveCourses = useBulkApproveCourses();
  const approveMentors = useBulkApproveMentors();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => importUsers.mutate({ users: [] })}>Import Users</Button>
          <Button className="ml-2" variant="outline" onClick={() => exportUsers.mutate()}>
            Export Users
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => sendNotifications.mutate({ message: "Hello" })}>Send Bulk Notifications</Button>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => approveCourses.mutate({ courseIds: [] })}>Bulk Approve Courses</Button>
          <Button className="ml-2" variant="outline" onClick={() => approveMentors.mutate({ mentorIds: [] })}>
            Bulk Approve Mentors
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
