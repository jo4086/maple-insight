import type { DomainType, CacheValue } from './cache.type';

// WARN: 자동 생성 데이터 ↓ (수정 금지)
const DomainList: DomainType[] = ['character'];
// WARN: 자동 생성 데이터 ↑ (수정 금지)

const ExtendedDomainList: DomainType[] = [...DomainList] as const;

// 필요 시 수동 추가 (예: 실험용 도메인, 임시 캐시 등)
// 사용시 주석 제거
// ExtendedDomainList.push('test' as DomainType);  // 타입 강제 확장 시 as 사용

const cacheRegistry = {} as Record<DomainType, [Map<string, CacheValue>, WeakMap<object, CacheValue>]>;

ExtendedDomainList.forEach((domain) => {
  cacheRegistry[domain] = [new Map(), new WeakMap()];
});

export function setCache(domain: DomainType, key: string, value: CacheValue) {
  cacheRegistry[domain][0].set(key, value);
}

export function getCache(domain: DomainType, key: string) {
  return cacheRegistry[domain][0].get(key);
}

export function deleteCache(domain: DomainType, key: string) {
  cacheRegistry[domain][0].delete(key);
}

export type ExtendDomainType = (typeof ExtendedDomainList)[number];
export { ExtendedDomainList, cacheRegistry };
