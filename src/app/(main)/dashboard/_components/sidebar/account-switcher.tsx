"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BadgeCheck, Bell, CreditCard, LogOut, Wallet, Key } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin/admin-provider";
import { useAuthStore } from "@/stores/auth/auth-provider";
import { ChangePasswordDialog } from "../admins/change-password-dialog";

export function AccountSwitcher() {
  const router = useRouter();
  const { user } = useAdminStore((state) => state);
  const logout = useAuthStore((state) => state.logout);
  const [mounted, setMounted] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  if (!mounted || !user) {
    return <div className="size-9" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 cursor-pointer rounded-lg">
          <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
          <AvatarFallback className="rounded-lg">{getInitials(user.name || user.email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
              <AvatarFallback className="rounded-lg">{getInitials(user.name || user.email)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <BadgeCheck />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/wallet")}>
            <Wallet />
            Wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
            <Bell />
            Notifications
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
            <Key />
            Change Password
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <ChangePasswordDialog 
        open={isPasswordDialogOpen} 
        onOpenChange={setIsPasswordDialogOpen} 
      />
    </DropdownMenu>
  );
}
