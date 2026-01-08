import { Metadata } from "next";

import { PlatformReviewsTable } from "../_components/reviews/platform-reviews-table";
import { MentorReviewsTable } from "../_components/reviews/mentor-reviews-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Reviews Moderation",
  description: "Moderate platform and course reviews",
};

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews Moderation</h1>
        <p className="text-muted-foreground mt-2">Approve, reject, or manage user reviews</p>
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList>
          <TabsTrigger value="platform">Platform Reviews</TabsTrigger>
          <TabsTrigger value="mentor">Mentor Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="platform" className="mt-6">
          <PlatformReviewsTable />
        </TabsContent>
        <TabsContent value="mentor" className="mt-6">
          <MentorReviewsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
