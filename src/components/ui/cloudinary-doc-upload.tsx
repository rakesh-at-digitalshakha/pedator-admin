"use client";

import * as React from "react";
import { FileIcon, Upload, X, Loader2, ExternalLink } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CloudinaryDocUploadProps {
  /** For single-doc fields: name maps to one hidden input with a string URL */
  name: string;
  /** When true, allows selecting multiple files and stores a JSON array */
  multiple?: boolean;
  defaultValue?: string | string[];
  folder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  /** Added label for the accepted file types hint */
  accept?: string;
}

function getFileName(url: string) {
  try {
    return decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? url);
  } catch {
    return url;
  }
}

export function CloudinaryDocUpload({
  name,
  multiple = false,
  defaultValue,
  folder = "pedator/documents",
  disabled = false,
  className,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt",
}: CloudinaryDocUploadProps) {
  const normalise = (v?: string | string[]): string[] => {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(Boolean);
    // Support JSON array string or single URL
    if (v.startsWith("[")) {
      try { return JSON.parse(v) as string[]; } catch { return [v]; }
    }
    return [v];
  };

  const [urls, setUrls] = React.useState<string[]>(() => normalise(defaultValue));
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUrls(normalise(defaultValue));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValue)]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setError(null);
    setUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          setError(`${file.name} exceeds 50 MB limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
          "/cloudinary/upload/pdf",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.success) uploaded.push(res.data.data.url);
        else setError("One or more files failed to upload.");
      }

      if (multiple) {
        setUrls((prev) => [...prev, ...uploaded]);
      } else {
        setUrls(uploaded.slice(0, 1));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeUrl = (idx: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // Determine hidden input value format
  const hiddenValue = multiple ? JSON.stringify(urls) : (urls[0] ?? "");

  return (
    <div className={cn("grid gap-2", className)}>
      {/* Hidden input(s) for FormData */}
      <input type="hidden" name={name} value={hiddenValue} />

      {/* File list */}
      {urls.length > 0 && (
        <ul className="grid gap-1.5">
          {urls.map((u, idx) => (
            <li
              key={u}
              className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-xs hover:underline text-blue-600 dark:text-blue-400"
                title={getFileName(u)}
              >
                {getFileName(u)}
              </a>
              <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeUrl(idx)}
                  className="ml-1 text-destructive hover:text-destructive/80"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Upload button */}
      {!disabled && (multiple || urls.length === 0) && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex items-center justify-center gap-2 w-full rounded-md border-2 border-dashed px-4 py-4 text-sm text-muted-foreground transition-colors",
            "hover:border-primary hover:text-primary hover:bg-primary/5",
            uploading && "cursor-not-allowed opacity-50"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="size-4" />
              {multiple ? "Add document(s)" : "Upload document"}
              <span className="text-xs opacity-70">PDF, DOC, XLS · max 50 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
