import { deleteCache, getCache, setCache } from '../cache';
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
    delete(key: string) {
      deleteCache(domain, key);
    },
  };
}
