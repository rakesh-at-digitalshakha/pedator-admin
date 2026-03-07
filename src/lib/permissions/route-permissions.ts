/**
 * Maps dashboard route pathnames to the backend resource required for `read` access.
 * null  = route is accessible by ALL authenticated admins (no resource restriction)
 * string = user must have `read` on this resource
 */
export const ROUTE_PERMISSIONS: Record<string, string | null> = {
  "/dashboard/default": null,
  "/dashboard/profile": null,
  "/dashboard/coming-soon": null,

  // Admin management
  "/dashboard/admins": "admins",
  "/dashboard/roles": "admins",
  "/dashboard/activity-logs": "admins",
  "/dashboard/settings": "admins",

  // Mentors
  "/dashboard/mentor-management": "mentors",
  "/dashboard/mentors": "mentors",

  // Learners
  "/dashboard/learners": "learners",

  // Courses & categories
  "/dashboard/courses": "courses",
  "/dashboard/course-approvals": "courses",
  "/dashboard/categories": "courses",
  "/dashboard/subcategories": "courses",
  "/dashboard/test-series": "courses",
  "/dashboard/bulk-ops": "courses",

  // Bookings
  "/dashboard/bookings": "bookings",

  // Finance / wallet
  "/dashboard/wallet": "platform_wallet",
  "/dashboard/finance": "transactions",
  "/dashboard/payouts": "transactions",

  // Content / comms
  "/dashboard/notifications": "notifications",
  "/dashboard/reviews": "reviews",
  "/dashboard/video-sessions": "video_sessions",
  "/dashboard/promotions": "banners",

  // Support & safety
  "/dashboard/disputes": "disputes",
  "/dashboard/moderation": "support",
  "/dashboard/tickets": "support",
};

/**
 * Returns the resource required to access the given pathname.
 * - null   → unrestricted (any authenticated admin)
 * - string → must have `read` on this resource
 * - undefined → route not tracked (unrestricted)
 */
export function getRouteResource(pathname: string): string | null | undefined {
  return ROUTE_PERMISSIONS[pathname];
}
