import { redisClient } from '@/lib/redis';

function getCharacterKey(nickname: string) {
  return `maple-insight:character:${encodeURIComponent(nickname)}`;
}

export async function recordCharacterSearch(nickname: string) {
  await redisClient.hSet(getCharacterKey(nickname), {
    nickname,
    status: 'pending',
    searchedAt: new Date().toISOString(),
  });
}

export async function recordCharacterOcid(nickname: string, ocid: string) {
  await redisClient.hSet(getCharacterKey(nickname), {
    nickname,
    ocid,
    status: 'found',
    resolvedAt: new Date().toISOString(),
  });
}

export async function getCharacterOcid(nickname: string) {
  return redisClient.hGet(getCharacterKey(nickname), 'ocid');
}
