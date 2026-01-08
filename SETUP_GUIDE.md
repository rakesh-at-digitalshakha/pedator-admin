# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Backend API running on `localhost:9001`

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# The default API URL is already set to http://localhost:9001/api/v1
# Edit .env.local if your backend is on a different URL
```

### 3. Start Development Server

```bash
pnpm dev
```

The application will be available at: `http://localhost:3000`

### 4. Login

Navigate to `http://localhost:3000/auth/login` and login with your admin credentials.

## Project Structure

```
src/
├── app/
│   ├── (external)/          # Public pages
│   │   └── auth/login/      # Login page with API integration
│   └── (main)/
│       └── dashboard/
│           └── admin/       # All admin pages
│               ├── page.tsx             # Dashboard overview
│               ├── admins/              # Admin management
│               ├── mentors/             # Mentor approvals
│               ├── wallet/              # Wallet & transactions
│               ├── notifications/       # Notifications
│               ├── profile/             # Profile management
│               └── _components/         # Reusable admin components
├── hooks/
│   └── api/
│       └── use-admin.ts     # All API hooks (15+ hooks)
├── lib/
│   └── api/
│       ├── client.ts        # Axios instance with JWT
│       └── types.ts         # TypeScript definitions
├── stores/
│   ├── auth/                # Auth state (JWT tokens)
│   └── admin/               # Admin user state
└── navigation/
    └── sidebar/
        └── sidebar-items.ts # Navigation configuration
```

## Features

### ✅ Authentication

- JWT-based login
- Automatic token management
- Cookie sync for SSR
- Protected routes with middleware
- Logout functionality

### ✅ Admin Dashboard (`/dashboard/admin`)

- Statistics cards (users, mentors, approvals, revenue)
- Recent mentors table
- Recent transactions table
- Real-time data with React Query

### ✅ Admin Management (`/dashboard/admin/admins`)

- View all admin users
- Create new admins
- Update admin details
- Delete admins
- Search and filter

### ✅ Mentor Approvals (`/dashboard/admin/mentors`)

- View all mentor applications
- Approve mentors
- Reject mentors with reason
- Status indicators

### ✅ Wallet & Transactions (`/dashboard/admin/wallet`)

- View wallet balance
- Process withdrawals
- Transaction history
- Real-time balance updates

### ✅ Notifications (`/dashboard/admin/notifications`)

- View all notifications
- Mark as read
- Unread count badge
- Time ago formatting

### ✅ Profile Management (`/dashboard/admin/profile`)

- View profile information
- Update name and phone
- Account statistics
- Avatar display

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** Shadcn UI + Tailwind CSS
- **State Management:** Zustand 5.0.8
- **API State:** React Query 5.90.10
- **HTTP Client:** Axios 1.13.2
- **Forms:** React Hook Form
- **Tables:** @tanstack/react-table
- **Notifications:** Sonner
- **Icons:** Lucide React
- **TypeScript:** Full type safety

## API Integration

All pages use real API data via React Query hooks:

```typescript
// Example: Fetching admin stats
const { data: stats } = useGetAdminStats();

// Example: Creating admin
const createAdmin = useCreateAdmin();
await createAdmin.mutateAsync({ name, email, password });
```

### Available API Hooks

**Queries (GET):**

- `useGetAdminProfile()`
- `useGetAdminStats()`
- `useGetAllAdmins()`
- `useGetAllMentors(params)`
- `useGetAllTransactions(params)`
- `useGetAllUsers(params)`
- `useGetAdminNotifications()`

**Mutations (POST/PUT/DELETE):**

- `useLogin()`
- `useCreateAdmin()`
- `useUpdateAdmin()`
- `useDeleteAdmin()`
- `useUpdateAdminProfile()`
- `useApproveMentor()`
- `useRejectMentor()`
- `useWithdrawFromWallet()`
- `useMarkNotificationAsRead()`

## State Management

### Auth Store

```typescript
const { token, setToken, logout } = useAuthStore();
```

- Manages JWT token
- Syncs with localStorage and cookies
- Handles logout

### Admin Store

```typescript
const { user, setUser, updateWallet } = useAdminStore();
```

- Stores admin profile data
- Real-time wallet updates
- Persists across navigation

## Middleware Protection

All `/dashboard/*` routes are protected by middleware:

- Checks for JWT token in cookies
- Redirects to login if not authenticated
- Redirects to dashboard if already logged in on login page

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check
```

## Troubleshooting

### Backend not connecting?

1. Verify backend is running on `localhost:9001`
2. Check `.env.local` has correct API URL
3. Check browser console for CORS errors
4. Verify backend allows `http://localhost:3000` origin

### Login not working?

1. Check credentials are correct
2. Open Network tab and check API response
3. Verify backend `/auth/login/admin` endpoint is working
4. Check if token is being stored in localStorage

### Token expired?

1. Logout and login again
2. Token automatically refreshes on API calls
3. 401 errors trigger automatic logout

### Pages not loading data?

1. Check if logged in
2. Verify API endpoints in backend
3. Check browser console for errors
4. Verify React Query dev tools

## Documentation

- **Full API Integration Guide:** `ADMIN_API_INTEGRATION.md`
- **Component Documentation:** See individual component files
- **API Types:** `src/lib/api/types.ts`

## Next Steps

1. ✅ Login with admin credentials
2. ✅ Explore dashboard with real data
3. ✅ Test CRUD operations
4. ✅ Check notifications
5. ✅ Update profile
6. ✅ Process withdrawals

## Support

For detailed documentation, see: `ADMIN_API_INTEGRATION.md`

For issues:

1. Check browser console for errors
2. Check Network tab for API responses
3. Verify backend is running and accessible
4. Check environment variables are set correctly

---

**Ready to go!** 🚀

All API hooks are integrated, UI components are created, and the admin dashboard is fully functional with real data from your backend API.
