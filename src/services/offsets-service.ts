import {
  CACHE_TTL_MS,
  DEFAULTS,
  REQUIRED_KEYS,
  URLS,
} from "../../config/constants.js";
import type { CacheInfo } from "../lib/schemas/cache-info.js";
import type { OffsetsResponse } from "../lib/schemas/offsets-response.js";
import type { DllMap } from "../utils/flatten.js";
import { flattenClientJson, flattenDllMap } from "../utils/flatten.js";
import { pickRequiredKeys } from "../utils/pick.js";
import { nowIso } from "../utils/time.js";
import type { CacheStore } from "./cache-store.js";
import { fetchJson } from "./http-client.js";

export function createOffsetsService(cache: CacheStore) {
  let inFlight: Promise<OffsetsResponse> | null = null;

  function msUntilExpiry(): number {
    if (!cache.lastFetchMs) {
      return 0;
    }
    const ageMs = Date.now() - cache.lastFetchMs;
    return Math.max(0, CACHE_TTL_MS - ageMs);
  }

  function cacheInfo(): CacheInfo {
    const remainingMs = msUntilExpiry();
    return {
      ttlMs: CACHE_TTL_MS,
      status: cache.lastFetchStatus,
      fetchCount: cache.fetchCount,
      lastFetchAt: cache.lastFetchAt,
      expiresAt: cache.expiresAt,
      ageMs: cache.lastFetchMs ? Date.now() - cache.lastFetchMs : null,
      remainingMs,
      remainingSeconds:
        remainingMs != null ? Math.floor(remainingMs / 1000) : null,
      lastDurationMs: cache.lastDurationMs,
      lastError: cache.lastError,
    };
  }

  async function refreshCache(): Promise<OffsetsResponse> {
    const start = Date.now();
    try {
      const [offsetsRaw, clientDllRaw] = await Promise.all([
        fetchJson<DllMap>(URLS.offsets),
        fetchJson<unknown>(URLS.clientDll),
      ]);

      const offsetsFlat = flattenDllMap(offsetsRaw);
      const clientFlat = flattenClientJson(clientDllRaw);

      const merged = { ...offsetsFlat, ...clientFlat };
      const { result, missingKeys } = pickRequiredKeys(
        merged,
        REQUIRED_KEYS,
        DEFAULTS
      );

      const fetchedAt = nowIso();
      const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();

      cache.payload = {
        ok: true,
        timestamp: fetchedAt,
        offsets: result,
        missingKeys: [...missingKeys],
        cache: {} as CacheInfo,
      };

      cache.lastFetchAt = fetchedAt;
      cache.expiresAt = expiresAt;
      cache.lastFetchMs = Date.now();
      cache.lastFetchStatus = "ok";
      cache.lastError = null;
      cache.fetchCount += 1;
      cache.lastDurationMs = Date.now() - start;

      cache.payload.cache = cacheInfo();

      return cache.payload;
    } catch (err) {
      cache.lastFetchStatus = "error";
      cache.lastError = err instanceof Error ? err.message : String(err);
      cache.fetchCount += 1;
      cache.lastDurationMs = Date.now() - start;

      if (cache.payload) {
        return {
          ...cache.payload,
          ok: true,
          timestamp: nowIso(),
          cache: cacheInfo(),
          stale: true,
          error: cache.lastError ?? undefined,
        };
      }

      throw err;
    }
  }

  async function getPayloadWithCache(): Promise<OffsetsResponse> {
    if (
      cache.payload &&
      cache.lastFetchMs &&
      Date.now() - cache.lastFetchMs < CACHE_TTL_MS
    ) {
      return {
        ...cache.payload,
        timestamp: nowIso(),
        cache: cacheInfo(),
      };
    }

    if (!inFlight) {
      inFlight = (async () => {
        try {
          return await refreshCache();
        } finally {
          inFlight = null;
        }
      })();
    }

    return await inFlight;
  }

  return { getPayloadWithCache, cacheInfo };
}
