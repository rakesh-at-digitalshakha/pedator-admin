# 🚀 Quick Start Guide

## Prerequisites

- Backend API running on `http://localhost:9001`
- Node.js and pnpm installed

## Steps to Run

### 1. Environment Setup

The `.env.local` file has been created with:

```
NEXT_PUBLIC_API_URL=http://localhost:9001/api/v1
```

### 2. Install Dependencies (if needed)

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Test Login

1. Navigate to http://localhost:3000/auth/login
2. Enter credentials:
   - **Email**: `admin@pedator.com`
   - **Password**: `898200`
3. Click "Login"
4. You'll be redirected to `/dashboard` on success

## What Happens Behind the Scenes

1. **Form Submission** → Calls `useLogin()` hook
2. **API Call** → POST to `http://localhost:9001/api/v1/admin/login`
3. **Success Response** → Stores:
   - JWT token in localStorage + cookies
   - User data in localStorage
   - State in Zustand stores
4. **Redirect** → Navigate to `/dashboard`
5. **Middleware** → Protects routes, checks token in cookies

## Testing Authentication

### Check if logged in:

Open browser console and run:

```javascript
authDebug.runDiagnostics();
```

### View stored data:

```javascript
authDebug.hasToken();
authDebug.hasUser();
```

### Clear auth data:

```javascript
authDebug.clearAll();
```

## Using Auth in Your Components

```tsx
import { useAuth } from "@/hooks/use-auth";

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Making API Calls

### Use existing hooks:

```tsx
import { useLogin } from "@/hooks/api";

const { mutate: login, isPending } = useLogin();
```

### Create new API hooks:

Add to `src/hooks/api/use-admin.ts` or create new files following the pattern:

```typescript
export const useMyEndpoint = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/endpoint", data);
      return response.data;
    },
  });
};
```

## Logout Implementation

The `UserMenu` component in `src/components/user-menu.tsx` shows a complete example.

To add it to your layout:

```tsx
import { UserMenu } from "@/components/user-menu";

// In your header/sidebar:
<UserMenu />;
```

## Troubleshooting

### Login not working?

1. Check backend is running: http://localhost:9001
2. Check browser console for errors
3. Check Network tab in DevTools
4. Verify credentials are correct
5. Run `authDebug.testApi()` in console

### Token not persisting?

1. Check localStorage in DevTools → Application tab
2. Check cookies in DevTools → Application → Cookies
3. Verify middleware.ts exists in project root

### Redirect issues?

1. Check `middleware.ts` in project root
2. Verify public routes are correct
3. Check token is in cookies (middleware reads from cookies)

## API Response Format

Your API must return this format:

```json
{
  "status": "success",
  "message": "Logged in",
  "user": {
    "_id": "...",
    "email": "...",
    "role": "...",
    "status": true,
    "realWallet": 0,
    "virtualWallet": 0,
    "wallet": 0,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGc..."
}
```

## Next Steps

1. ✅ Test login flow
2. ✅ Integrate `UserMenu` in your header
3. ✅ Add more API endpoints as needed
4. ✅ Customize protected routes
5. ✅ Add password reset flow (if needed)
6. ✅ Add remember me functionality (already in form)
7. ✅ Add token refresh logic (if backend supports it)

## Need Help?

Check these files for reference:

- `AUTH_INTEGRATION.md` - Complete documentation
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `src/app/(main)/auth/_components/login-form.tsx` - Working example
- `src/components/user-menu.tsx` - Logout example

Happy coding! 🎉
