import type { CacheInfo, OffsetsResponse } from "./schemas.js";

export interface OffsetsService {
  cacheInfo(): CacheInfo;
  getPayloadWithCache(): Promise<OffsetsResponse>;
}
