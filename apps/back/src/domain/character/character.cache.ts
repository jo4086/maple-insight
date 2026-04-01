import { createDomainCache } from '../../utils';

export const characterCache = createDomainCache('character');

const CHARACTER_LOOKUP_CACHE_PREFIX = 'lookup:';
const CHARACTER_LOOKUP_TTL_MS = 1000 * 60 * 60;
const characterLookupTimers = new Map<string, ReturnType<typeof setTimeout>>();

export interface CharacterLookupCacheValue {
  nickname: string;
  ocid: string;
  characterClass: string;
  expiresAt: number;
}

function getLookupCacheKey(nickname: string) {
  return `${CHARACTER_LOOKUP_CACHE_PREFIX}${nickname}`;
}

function scheduleCharacterLookupCacheDeletion(key: string) {
  const prevTimer = characterLookupTimers.get(key);

  if (prevTimer) {
    clearTimeout(prevTimer);
  }

  const timer = setTimeout(() => {
    characterCache.delete(key);
    characterLookupTimers.delete(key);
  }, CHARACTER_LOOKUP_TTL_MS);

  characterLookupTimers.set(key, timer);
}

export function getCachedCharacterLookup(nickname: string): CharacterLookupCacheValue | null {
  const key = getLookupCacheKey(nickname);
  const cached = characterCache.get(key) as CharacterLookupCacheValue | undefined;

  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    characterCache.delete(key);
    const prevTimer = characterLookupTimers.get(key);
    if (prevTimer) {
      clearTimeout(prevTimer);
      characterLookupTimers.delete(key);
    }
    return null;
  }

  const refreshed = {
    ...cached,
    expiresAt: Date.now() + CHARACTER_LOOKUP_TTL_MS,
  };

  characterCache.set(key, refreshed);
  scheduleCharacterLookupCacheDeletion(key);

  return refreshed;
}

export function setCachedCharacterLookup(nickname: string, ocid: string, characterClass: string) {
  const key = getLookupCacheKey(nickname);

  characterCache.set(key, {
    nickname,
    ocid,
    characterClass,
    expiresAt: Date.now() + CHARACTER_LOOKUP_TTL_MS,
  });

  scheduleCharacterLookupCacheDeletion(key);
}
