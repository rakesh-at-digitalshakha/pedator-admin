import {
  Users,
  LayoutDashboard,
  Shield,
  Wallet,
  UserCheck,
  Bell,
  BookOpen,
  CalendarDays,
  FolderTree,
  Star,
  Video,
  ShieldAlert,
  Gavel,
  Ticket,
  Megaphone,
  List,
  Settings,
  Layers,
  Boxes,
  Folder,
  UserCircle,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  /** Backend resource name required for read access. null/undefined = unrestricted. */
  resource?: string | null;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  /** Backend resource name required for read access. null/undefined = unrestricted. */
  resource?: string | null;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Admin",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
        resource: null,
      },
      {
        title: "Admins",
        url: "/dashboard/admins",
        icon: Shield,
        resource: "admins",
        subItems: [
          {
            title: "Admin Users",
            url: "/dashboard/admins",
            icon: Shield,
            resource: "admins",
          },
          {
            title: "Roles & Permissions",
            url: "/dashboard/roles",
            icon: KeyRound,
            resource: "admins",
          },
        ],
      },
      {
        title: "Mentors",
        url: "/dashboard/mentor-management",
        icon: UserCircle,
        resource: "mentors",
        subItems: [
          {
            title: "All Mentors",
            url: "/dashboard/mentor-management",
            icon: Users,
            resource: "mentors",
          },
          {
            title: "Mentor Approvals",
            url: "/dashboard/mentors",
            icon: UserCheck,
            resource: "mentors",
          },
        ],
      },
      {
        title: "Learners",
        url: "/dashboard/learners",
        icon: Users,
        resource: "learners",
      },
      {
        title: "Courses",
        url: "/dashboard/courses",
        icon: BookOpen,
        resource: "courses",
        subItems: [
          {
            title: "All Courses",
            url: "/dashboard/courses",
            icon: BookOpen,
            resource: "courses",
          },
          {
            title: "Course Approvals",
            url: "/dashboard/course-approvals",
            icon: UserCheck,
            resource: "courses",
          },
        ],
      },
      {
        title: "Bookings",
        url: "/dashboard/bookings",
        icon: CalendarDays,
        resource: "bookings",
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: FolderTree,
        resource: "courses",
        subItems: [
          {
            title: "Categories",
            url: "/dashboard/categories",
            icon: Folder,
            resource: "courses",
          },
          {
            title: "Subcategories",
            url: "/dashboard/subcategories",
            icon: FolderTree,
            resource: "courses",
          },
          {
            title: "Modules",
            url: "/dashboard/modules",
            icon: Layers,
            resource: "courses",
          },
          {
            title: "Lessons",
            url: "/dashboard/lessons",
            icon: Boxes,
            resource: "courses",
          },
        ],
      },
      {
        title: "Reviews",
        url: "/dashboard/reviews",
        icon: Star,
        resource: "reviews",
      },
      {
        title: "Video Sessions",
        url: "/dashboard/video-sessions",
        icon: Video,
        resource: "video_sessions",
      },
      {
        title: "Wallet",
        url: "/dashboard/wallet",
        icon: Wallet,
        resource: "platform_wallet",
      },
      // {
      //   title: "Notifications",
      //   url: "/dashboard/notifications",
      //   icon: Bell,
      //   resource: "notifications",
      // },
    ],
  },
  // Admin Tools (new suggested features)
  {
    id: 3,
    label: "Admin Tools",
    items: [
      {
        title: "Disputes",
        url: "/dashboard/disputes",
        icon: ShieldAlert,
        resource: "disputes",
      },
      {
        title: "Moderation",
        url: "/dashboard/moderation",
        icon: Gavel,
        resource: "support",
      },
      {
        title: "Tickets",
        url: "/dashboard/tickets",
        icon: Ticket,
        resource: "support",
      },
      {
        title: "Promotions",
        url: "/dashboard/promotions",
        icon: Megaphone,
        resource: "banners",
      },
      {
        title: "Payouts",
        url: "/dashboard/payouts",
        icon: Wallet,
        resource: "transactions",
      },
      {
        title: "Activity Logs",
        url: "/dashboard/activity-logs",
        icon: List,
        resource: "admins",
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        resource: "admins",
      },
      // {
      //   title: "Test Series",
      //   url: "/dashboard/test-series",
      //   icon: Layers,
      //   resource: "courses",
      // },
      // {
      //   title: "Bulk Ops",
      //   url: "/dashboard/bulk-ops",
      //   icon: Boxes,
      //   resource: "courses",
      // },
    ],
  },
];
