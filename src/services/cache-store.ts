import type { CacheInfo } from "../lib/schemas/cache-info.js";
import type { OffsetsResponse } from "../lib/schemas/offsets-response.js";

export type CacheStatus = CacheInfo["status"];

export interface CacheStore {
  expiresAt: string | null;
  fetchCount: number;
  lastDurationMs: number | null;
  lastError: string | null;
  lastFetchAt: string | null;
  lastFetchMs: number | null;
  lastFetchStatus: CacheStatus;
  payload: OffsetsResponse | null;
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
