import {
  Users,
  LayoutDashboard,
  ChartBar,
  Shield,
  Wallet,
  UserCheck,
  Bell,
  BookOpen,
  CalendarDays,
  FolderTree,
  Star,
  Video,
  BarChart3,
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
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
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
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Admins",
        url: "/dashboard/admins",
        icon: Shield,
      },
      {
        title: "Mentors",
        url: "/dashboard/mentor-management",
        icon: UserCircle,
        subItems: [
          {
            title: "All Mentors",
            url: "/dashboard/mentor-management",
            icon: Users,
          },
          {
            title: "Mentor Approvals",
            url: "/dashboard/mentors",
            icon: UserCheck,
          },
        ],
      },
      {
        title: "Learners",
        url: "/dashboard/learners",
        icon: Users,
      },
      {
        title: "Courses",
        url: "/dashboard/courses",
        icon: BookOpen,
        subItems: [
          {
            title: "All Courses",
            url: "/dashboard/courses",
            icon: BookOpen,
          },
          {
            title: "Course Approvals",
            url: "/dashboard/course-approvals",
            icon: UserCheck,
          },
        ],
      },
      {
        title: "Bookings",
        url: "/dashboard/bookings",
        icon: CalendarDays,
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: FolderTree,
        subItems: [
          {
            title: "Categories",
            url: "/dashboard/categories",
            icon: Folder,
          },
          {
            title: "Subcategories",
            url: "/dashboard/subcategories",
            icon: FolderTree,
          },
        ],
      },
      {
        title: "Reviews",
        url: "/dashboard/reviews",
        icon: Star,
      },
      {
        title: "Video Sessions",
        url: "/dashboard/video-sessions",
        icon: Video,
      },
      {
        title: "Wallet",
        url: "/dashboard/wallet",
        icon: Wallet,
      },
      {
        title: "Notifications",
        url: "/dashboard/notifications",
        icon: Bell,
      },
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
      },
      {
        title: "Moderation",
        url: "/dashboard/moderation",
        icon: Gavel,
      },
      {
        title: "Tickets",
        url: "/dashboard/tickets",
        icon: Ticket,
      },
      {
        title: "Promotions",
        url: "/dashboard/promotions",
        icon: Megaphone,
      },
      {
        title: "Payouts",
        url: "/dashboard/payouts",
        icon: Wallet,
      },
      {
        title: "Activity Logs",
        url: "/dashboard/activity-logs",
        icon: List,
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Test Series",
        url: "/dashboard/test-series",
        icon: Layers,
      },
      {
        title: "Bulk Ops",
        url: "/dashboard/bulk-ops",
        icon: Boxes,
      },
    ],
  },
];
