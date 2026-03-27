"use client";

import * as React from "react";
import { VideoIcon, Upload, X, Loader2, Film } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CloudinaryVideoUploadProps {
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (url: string) => void;
  folder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function CloudinaryVideoUpload({
  name,
  defaultValue = "",
  value,
  onChange,
  folder = "pedator/videos",
  label,
  disabled = false,
  className,
}: CloudinaryVideoUploadProps) {
  const isControlled = value !== undefined;
  const [internalUrl, setInternalUrl] = React.useState(defaultValue);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const url = isControlled ? value ?? "" : internalUrl;

  const updateUrl = (nextUrl: string) => {
    if (!isControlled) {
      setInternalUrl(nextUrl);
    }
    onChange?.(nextUrl);
  };

  React.useEffect(() => {
    if (!isControlled) {
      setInternalUrl(defaultValue ?? "");
    }
  }, [defaultValue, isControlled]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
    if (!allowed.includes(file.type)) {
      setError("Only MP4, WEBM, OGG, MOV or AVI allowed.");
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError("File must be under 200 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
        "/cloudinary/upload/video",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
          },
        }
      );

      if (res.data.success) {
        updateUrl(res.data.data.url);
      } else {
        setError("Upload failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    updateUrl("");
    setError(null);
  };

  return (
    <div className={cn("grid gap-1.5", className)}>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative rounded-md border overflow-hidden bg-black">
          <video
            src={url}
            controls
            className="w-full max-h-48 object-contain"
          />
          {!disabled && (
            <div className="flex items-center gap-2 px-3 py-2 border-t bg-muted">
              <Film className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate flex-1">
                {url.split("/").pop()}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="h-7 gap-1"
              >
                <Upload className="size-3" />
                Replace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                className="h-7 text-destructive hover:text-destructive"
              >
                <X className="size-3.5" />
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
              <span>Uploading… {progress > 0 ? `${progress}%` : ""}</span>
              {progress > 0 && (
                <div className="w-full max-w-[200px] h-1.5 rounded-full bg-muted-foreground/20 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <VideoIcon className="size-6" />
              <span>Click to upload video</span>
              <span className="text-xs">MP4, WEBM, MOV, AVI · max 200 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
