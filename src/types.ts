import type { CacheInfo } from "./services/cache-store.js";

export interface OffsetsService {
  cacheInfo(): CacheInfo;
  getPayloadWithCache(): Promise<
    import("./services/cache-store.js").OffsetsPayload
  >;
}
