import { getCachedCharacterLookup, setCachedCharacterLookup } from './character.cache';
import { CHARACTER_ENDPOINTS, type CharacterEndpoint, type CharacterApiEndpoint } from './character.constants';
import { CharacterService, getCharacterOCID } from './character.service';
import { toCharacterResponse } from './mappers';

import { createSuccessResponse } from '@/types';

function getCharacterClassFromBasic(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  if (!('character_class' in data)) return null;

  return typeof data.character_class === 'string' ? data.character_class : null;
}

function mergeSkillResults(data: Record<string, unknown>) {
  const mergedData: Record<string, unknown> = {};
  const skillResults: { classLevel: string; info: unknown }[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('skill-')) {
      skillResults.push({
        classLevel: key.replace('skill-', ''),
        info: value,
      });
      continue;
    }

    mergedData[key] = value;
  }

  if (skillResults.length > 0) {
    mergedData.skill = skillResults;
  }

  return mergedData;
}

const lookup: AppHandler<object, unknown, unknown, { nick: string; date?: string | null }> = async (req, res, next) => {
  try {
    const { nick, date = null } = req.query;

    const cachedLookup = getCachedCharacterLookup(nick);
    const ocid = cachedLookup?.ocid ?? (await getCharacterOCID(nick)).ocid;

    const service = new CharacterService(ocid, date, cachedLookup?.characterClass ?? null);

    const requestedEndpoints: CharacterEndpoint[] = [...CHARACTER_ENDPOINTS];
    const apiEndpoints = expandCompositeEndpoints(requestedEndpoints);

    const shouldFetchBasic = apiEndpoints.includes('basic');
    const endpointsWithoutBasic = apiEndpoints.filter((endpoint) => endpoint !== 'basic');

    let basicData: unknown = null;

    if (shouldFetchBasic) {
      basicData = await service.call('basic');

      const basicCharacterClass = getCharacterClassFromBasic(basicData);
      const cachedCharacterClass = cachedLookup?.characterClass ?? null;

      if (basicCharacterClass && basicCharacterClass !== cachedCharacterClass) {
        setCachedCharacterLookup(nick, ocid, basicCharacterClass);
      }
    }

    const requests = await service.createRequestsWithSkill(endpointsWithoutBasic);
    const restData = await service.getMultipleWithDelay(requests);
    const rawData = shouldFetchBasic ? { basic: basicData, ...restData } : restData;
    const mergedData = mergeSkillResults(rawData);

    const data = toCharacterResponse(mergedData, requestedEndpoints);

    return res.status(200).json(createSuccessResponse(data));
  } catch (error) {
    const appError: AppError = {
      statusCode: 500,
      message: error instanceof Error ? error.message : '캐릭터 조회 중 오류 발생',
    };

    next?.(appError);
  }
};

const characterController = { lookup };
export default characterController;

function expandCompositeEndpoints(endpoints: CharacterEndpoint[]): CharacterApiEndpoint[] {
  const expanded = new Set<CharacterApiEndpoint>();

  for (const endpoint of endpoints) {
    if (endpoint === 'equipment') {
      expanded.add('item-equipment');
      expanded.add('android-equipment');
      continue;
    }

    expanded.add(endpoint);
  }

  return [...expanded];
}
