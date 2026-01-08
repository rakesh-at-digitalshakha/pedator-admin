import { Metadata } from "next";

import { VideoSessionsTable } from "../_components/video-sessions/video-sessions-table";

export const metadata: Metadata = {
  title: "Video Sessions",
  description: "Monitor all video sessions",
};

export default function VideoSessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Sessions</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage all video mentoring sessions</p>
      </div>

      <VideoSessionsTable />
    </div>
  );
}
