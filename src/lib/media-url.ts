const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;

export function resolveMediaUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return "";

  const value = pathOrUrl.trim();
  if (!value) return "";

  if (
    ABSOLUTE_URL_PATTERN.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const base = process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL?.trim() || "";
  if (!base) return value;

  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = value.replace(/^\/+/, "");

  return `${normalizedBase}/${normalizedPath}`;
}