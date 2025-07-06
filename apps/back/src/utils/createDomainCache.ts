import { setCache, getCache } from '../cache';
import type { ExtendDomainType } from '../cache';
import type { CacheValue } from '../cache/cache.type';

export function createDomainCache(domain: ExtendDomainType) {
  return {
    set(key: string, value: CacheValue) {
      setCache(domain, key, value);
    },
    get(key: string) {
      return getCache(domain, key);
    },
  };
}
