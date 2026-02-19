import { sanitizePlainText } from "@/lib/security";

export function sanitizeQueryText(value: string | null, maxLength = 32) {
  if (!value) return "";
  return sanitizePlainText(value, maxLength).toLowerCase();
}

export function parsePositiveNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}
