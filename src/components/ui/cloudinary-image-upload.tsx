"use client";

import * as React from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CloudinaryImageUploadProps {
  /** Name for the hidden <input> — matches FormData key */
  name: string;
  /** Existing URL (edit mode pre-fill) */
  defaultValue?: string;
  /** Cloudinary sub-folder, default: pedator/images */
  folder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function CloudinaryImageUpload({
  name,
  defaultValue = "",
  folder = "pedator/images",
  label,
  disabled = false,
  className,
}: CloudinaryImageUploadProps) {
  const [url, setUrl] = React.useState(defaultValue);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync if defaultValue changes (e.g. dialog key re-mount)
  React.useEffect(() => {
    setUrl(defaultValue ?? "");
  }, [defaultValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, WEBP, GIF or SVG allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
        "/cloudinary/upload/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setUrl(res.data.data.url);
      } else {
        setError("Upload failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setUrl("");
    setError(null);
  };

  return (
    <div className={cn("grid gap-1.5", className)}>
      {/* Hidden input carries the URL into FormData */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative group w-full rounded-md border overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label ?? name}
            className="w-full max-h-48 object-contain bg-black/5"
          />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="h-8 gap-1.5"
              >
                <X className="size-3.5" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 w-full rounded-md border-2 border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors",
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
              <span>Click to upload image</span>
              <span className="text-xs">JPG, PNG, WEBP, GIF, SVG · max 10 MB</span>
            </>
          )}
        </button>
      )}

      {/* Invisible native file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
