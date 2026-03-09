import type { CacheInfo } from "../schemas/cache-info.js";
import type { OffsetsResponse } from "../schemas/offsets-response.js";

export interface OffsetsService {
  cacheInfo(): CacheInfo;
  getPayloadWithCache(): Promise<OffsetsResponse>;
}
