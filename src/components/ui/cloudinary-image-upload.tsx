"use client";

import * as React from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CloudinaryImageUploadProps {
  /** Name for the hidden <input> — matches FormData key */
  name: string;
  /** When true, stores a list of image URLs */
  multiple?: boolean;
  /** Existing URL (edit mode pre-fill) */
  defaultValue?: string | string[];
  /** Controlled value for React form state */
  value?: string | string[];
  /** Called whenever uploaded URL changes */
  onChange?: (url: string | string[]) => void;
  /** Cloudinary sub-folder, default: pedator/images */
  folder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  /** Smaller square preview for icons */
  compact?: boolean;
}

function normaliseUrls(value?: string | string[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export function CloudinaryImageUpload({
  name,
  multiple = false,
  defaultValue = "",
  value,
  onChange,
  folder = "pedator/images",
  label,
  disabled = false,
  className,
  compact = false,
}: CloudinaryImageUploadProps) {
  const isControlled = value !== undefined;
  const [internalUrls, setInternalUrls] = React.useState<string[]>(() => normaliseUrls(defaultValue));
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const urls = isControlled ? normaliseUrls(value) : internalUrls;

  const updateUrls = (nextUrls: string[]) => {
    if (!isControlled) {
      setInternalUrls(nextUrls);
    }
    if (!onChange) return;
    onChange(multiple ? nextUrls : (nextUrls[0] ?? ""));
  };

  // Sync if defaultValue changes (e.g. dialog key re-mount)
  React.useEffect(() => {
    if (!isControlled) {
      setInternalUrls(normaliseUrls(defaultValue));
    }
  }, [defaultValue, isControlled]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    const selected = (multiple ? files : files.slice(0, 1)).filter((file) => {
      if (!allowed.includes(file.type)) {
        setError("Only JPG, PNG, WEBP, GIF or SVG allowed.");
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Each file must be under 10 MB.");
        return false;
      }
      return true;
    });
    if (selected.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await apiClient.post<{ success: boolean; data: { url: string; path?: string } }>(
          "/s3/upload/image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (!res.data.success) {
          setError("Upload failed.");
          continue;
        }
        uploadedUrls.push(res.data.data.path ?? res.data.data.url);
      }
      if (uploadedUrls.length > 0) {
        updateUrls(multiple ? [...urls, ...uploadedUrls] : [uploadedUrls[0]]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    updateUrls(urls.filter((_, i) => i !== index));
    setError(null);
  };

  const showDropzone = !disabled && (multiple || urls.length === 0);

  return (
    <div className={cn("grid gap-2", className)}>
      <input type="hidden" name={name} value={multiple ? JSON.stringify(urls) : (urls[0] ?? "")} />

      {urls.length > 0 && (
        <div className={cn(multiple ? "grid grid-cols-3 gap-2" : "grid")}>
          {urls.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className={cn(
                "relative group w-full rounded-md border overflow-hidden bg-muted",
                compact && "max-w-28"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(item)}
                alt={label ?? name}
                className={cn(
                  "w-full object-contain bg-black/5",
                  compact ? "h-28" : "max-h-48"
                )}
              />
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!multiple && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => inputRef.current?.click()}
                      disabled={uploading}
                      className="h-8 gap-1.5"
                    >
                      <Upload className="size-3.5" />
                      Replace
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(index)}
                    className="h-8 gap-1.5"
                  >
                    <X className="size-3.5" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropzone && (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 w-full rounded-md border-2 border-dashed px-4 text-sm text-muted-foreground transition-colors",
            compact ? "max-w-28 py-4" : "py-6",
            "hover:border-primary hover:text-primary hover:bg-primary/5",
            (disabled || uploading) && "cursor-not-allowed opacity-50"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <ImageIcon className="size-6" />
              <span>{multiple && urls.length > 0 ? "Add image" : "Click to upload image"}</span>
              <span className="text-xs text-center">JPG, PNG, WEBP, GIF, SVG · max 10 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
