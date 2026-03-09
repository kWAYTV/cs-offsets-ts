export type CacheStatus = "never" | "ok" | "error";

export interface CacheStore {
  expiresAt: string | null;
  fetchCount: number;
  lastDurationMs: number | null;
  lastError: string | null;
  lastFetchAt: string | null;
  lastFetchMs: number | null;
  lastFetchStatus: CacheStatus;
  payload: OffsetsPayload | null;
}

export interface OffsetsPayload {
  cache: CacheInfo;
  error?: string;
  missingKeys: string[];
  offsets: Record<string, number>;
  ok: boolean;
  /** Present when serving stale cache after fetch error */
  stale?: boolean;
  timestamp: string;
}

export interface CacheInfo {
  ageMs: number | null;
  expiresAt: string | null;
  fetchCount: number;
  lastDurationMs: number | null;
  lastError: string | null;
  lastFetchAt: string | null;
  remainingMs: number;
  remainingSeconds: number | null;
  status: CacheStatus;
  ttlMs: number;
}

export function createCacheStore(): CacheStore {
  return {
    payload: null,
    lastFetchAt: null,
    expiresAt: null,
    lastFetchMs: null,
    lastFetchStatus: "never",
    lastError: null,
    fetchCount: 0,
    lastDurationMs: null,
  };
}
