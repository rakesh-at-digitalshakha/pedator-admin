"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminNotifications, useMarkNotificationAsRead } from "@/hooks/api";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Mail } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetAdminNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      toast.success("Notification marked as read");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark as read");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage your admin notifications</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = notifications?.data?.filter((n) => !n.isRead).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="text-muted-foreground h-5 w-5" />
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </div>
      </div>

      {/* Notifications List */}
      {!notifications?.data || notifications.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-muted-foreground text-sm">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.data.map((notification) => (
            <Card key={notification._id} className={!notification.isRead ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      {!notification.isRead && <Badge variant="default">New</Badge>}
                    </div>
                    <CardDescription>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{notification.body || notification.message}</p>
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="bg-muted mt-4 rounded-lg p-4">
                    <p className="mb-2 text-xs font-medium">Additional Details:</p>
                    <pre className="overflow-x-auto text-xs">{JSON.stringify(notification.data, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
