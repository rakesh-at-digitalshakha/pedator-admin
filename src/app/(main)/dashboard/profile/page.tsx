"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/stores/admin/admin-provider";
import { useGetAdminProfile, useUpdateAdminProfile, useChangePassword } from "@/hooks/api";
import { apiClient } from "@/lib/api/client";
import { resolveMediaUrl } from "@/lib/media-url";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2,
  Camera,
  User,
  Phone,
  Mail,
  Briefcase,
  Shield,
  Key,
  CheckCircle,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  BadgeCheck,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  read:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  update: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  delete: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  download: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { setUser } = useAdminStore((s) => s);

  const { data: apiResponse, isLoading } = useGetAdminProfile();
  const updateMutation  = useUpdateAdminProfile();
  const passwordMutation = useChangePassword();

  const profile = (apiResponse as any)?.data ?? null;
  const role    = profile?.role ?? null;

  // ── Profile form state ────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:           "",
    phoneNumber:    "",
    designation:    "",
    profilePicture: "",
  });

  // ── Password form state ───────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Sync form from API response
  useEffect(() => {
    if (profile) {
      setForm({
        name:           profile.name           ?? "",
        phoneNumber:    profile.phoneNumber     ?? "",
        designation:    profile.designation     ?? "",
        profilePicture: profile.profilePicture  ?? "",
      });
    }
  }, [profile]);

  // ── Avatar upload handler ────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "pedator/admins");

      const res = await apiClient.post<{ success: boolean; data: { url: string; path?: string } }>(
        "/s3/upload/image",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        const uploadedPath = res.data.data.path ?? res.data.data.url;
        setForm((prev) => ({ ...prev, profilePicture: uploadedPath }));
        // Immediately persist the new avatar
        const updated = await updateMutation.mutateAsync({ profilePicture: uploadedPath } as any);
        if ((updated as any)?.data) setUser((updated as any).data);
        toast.success("Avatar updated");
      }
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // ── Profile submit ───────────────────────────────────────────────────────
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateMutation.mutateAsync(form as any);
      if ((updated as any)?.data) setUser((updated as any).data);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update profile");
    }
  };

  // ── Password submit ──────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await passwordMutation.mutateAsync({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to change password");
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="pt-6 space-y-4">
              <div className="flex gap-4"><Skeleton className="size-24 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-60" /></div></div>
              {[1,2,3].map(i=><Skeleton key={i} className="h-10 w-full" />)}
            </CardContent></Card>
            <Card><CardContent className="pt-6 space-y-4">{[1,2,3].map(i=><Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
          </div>
          <div className="space-y-6">
            <Card><CardContent className="pt-6 space-y-3">{[1,2,3,4].map(i=><Skeleton key={i} className="h-8 w-full" />)}</CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  const permissions = role?.permissions ?? [];
  const isSuperAdmin = role?.name?.toLowerCase().includes("super") || (role?.isSystem && permissions.length >= 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and security settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left / Main Column ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details and avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">

                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <Avatar className="size-24 ring-2 ring-border">
                      <AvatarImage src={resolveMediaUrl(form.profilePicture) || undefined} alt={form.name} />
                      <AvatarFallback className="text-2xl bg-muted">
                        {form.name ? getInitials(form.name) : <User className="w-8 h-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {avatarUploading
                        ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                        : <Camera className="w-6 h-6 text-white" />
                      }
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{form.name || "—"}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {profile?.email}
                    </p>
                    {role && (
                      <Badge variant="secondary" className="mt-1">
                        <Shield className="w-3 h-3 mr-1" />
                        {role.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="w-3.5 h-3.5 inline mr-1" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="w-3.5 h-3.5 inline mr-1" />
                      Email Address
                    </Label>
                    <Input id="email" value={profile?.email ?? ""} disabled />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      <Phone className="w-3.5 h-3.5 inline mr-1" />
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">
                      <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                      Designation
                    </Label>
                    <Input
                      id="designation"
                      value={form.designation}
                      onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                      placeholder="e.g. Platform Manager"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPw.current ? "text" : "password"}
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPw.new ? "text" : "password"}
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                        placeholder="Minimum 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPw.confirm ? "text" : "password"}
                        value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Repeat new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Match indicator */}
                {pwForm.confirmPassword && (
                  <p className={`text-xs flex items-center gap-1 ${pwForm.newPassword === pwForm.confirmPassword ? "text-green-600" : "text-destructive"}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {pwForm.newPassword === pwForm.confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  disabled={passwordMutation.isPending || pwForm.newPassword !== pwForm.confirmPassword}
                  className="w-full sm:w-auto"
                >
                  {passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Sidebar ─────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={profile?.status ? "default" : "destructive"}>
                  {profile?.status ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{role?.name ?? "—"}</span>
              </div>
              {role?.description && (
                <>
                  <Separator />
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">Description</span>
                    <span className="text-right text-xs">{role.description}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since
                </span>
                <span className="font-medium">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Last updated
                </span>
                <span className="font-medium">
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Permissions
              </CardTitle>
              <CardDescription>
                {isSuperAdmin ? "Full access to all resources" : `${permissions.length} resource${permissions.length !== 1 ? "s" : ""} accessible`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuperAdmin ? (
                <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-green-700 dark:text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Super Admin — unrestricted access
                </div>
              ) : permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No permissions assigned</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {permissions.map((perm: any) => (
                    <div key={perm.resource} className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {perm.resource.replace(/_/g, " ")}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {perm.actions.map((action: string) => (
                          <span
                            key={action}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[action] ?? "bg-muted text-muted-foreground"}`}
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

