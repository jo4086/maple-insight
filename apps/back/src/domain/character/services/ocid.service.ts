import { findOcidByCharacterName, upsertOcid } from '@maple/db/ocid';

import { getCachedCharacterLookup } from '../character.cache';
import { getCharacterOcid, recordCharacterOcid } from '../character.redis';

import { getCharacterOCID } from './character.service';

export type CharacterOcidSource = 'memory' | 'redis' | 'database' | 'nexon';

export type ResolvedCharacterOcid = {
  ocid: string;
  source: CharacterOcidSource;
};

export async function resolveCharacterOcid(nickname: string): Promise<ResolvedCharacterOcid> {
  const memoryCached = getCachedCharacterLookup(nickname);

  if (memoryCached?.ocid) {
    await recordCharacterOcid(nickname, memoryCached.ocid);
    return { ocid: memoryCached.ocid, source: 'memory' };
  }

  const redisCached = await getCharacterOcid(nickname);

  if (redisCached) {
    return { ocid: redisCached, source: 'redis' };
  }

  const databaseCached = await findOcidByCharacterName(nickname);

  if (databaseCached?.ocid) {
    await recordCharacterOcid(nickname, databaseCached.ocid);
    return { ocid: databaseCached.ocid, source: 'database' };
  }

  const { ocid } = await getCharacterOCID(nickname);

  await Promise.all([
    upsertOcid({
      characterName: nickname,
      ocid,
      status: 'found',
    }),
    recordCharacterOcid(nickname, ocid),
  ]);

  return { ocid, source: 'nexon' };
}
