import { getCachedCharacterLookup, setCachedCharacterLookup } from './character.cache';
import { type CharacterEndpoint } from './character.constants';
import { CharacterService, getCharacterOCID } from './character.service';

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

const lookup: AppHandler<object, unknown, unknown, { nick: string; date?: string | null }> = async (req, res) => {
  try {
    const { nick, date = null } = req.query;
    const cachedLookup = getCachedCharacterLookup(nick);
    const ocid = cachedLookup?.ocid ?? (await getCharacterOCID(nick)).ocid;

    const service = new CharacterService(ocid, date, cachedLookup?.characterClass ?? null);
    const endpoints: CharacterEndpoint[] = [
      'ability',
      'android-equipment',
      'basic',
      'beauty-equipment',
      'cashitem-equipment',
      'hyper-stat',
      'item-equipment',
      'popularity',
      'propensity',
      'stat',
      'set-effect',
      'symbol-equipment',
      'pet-equipment',
      'skill',
      'link-skill',
      'vmatrix',
      'hexamatrix',
      'hexamatrix-stat',
      'dojang',
      'other-stat',
      'ring-reserve-skill-equipment',
    ];

    const shouldFetchBasic = endpoints.includes('basic');
    const endpointsWithoutBasic = endpoints.filter((endpoint) => endpoint !== 'basic');

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
    const data = mergeSkillResults(rawData);

    console.log(data);

    return res.status(200).json({
      success: true,
      data,
      status: '200',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      status: 'Internal Server Error (500)',
      message: '캐릭터 ocid 조회 중 오류 발생',
    });
  }
};

const characterController = { lookup };
export default characterController;

// export default characterController;
