const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type FieldIssue = { field: string; message: string };

export class ApiError extends Error {
  status: number;
  details?: FieldIssue[];

  constructor(status: number, message: string, details?: FieldIssue[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  token: string | null,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Request failed", data.details);
  }
  return data as T;
}

export function toFieldErrors(details?: FieldIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  details?.forEach((d) => {
    if (!out[d.field]) out[d.field] = d.message;
  });
  return out;
}