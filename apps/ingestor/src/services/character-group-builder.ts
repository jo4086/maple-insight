import logger from '@@logger';
import {
  createCharacterGroupVersion,
  findActiveAnalysisCharacterGroups,
  findCharacterGroupingCandidates,
  markCharacterGroupSuperseded,
  updateActiveAnalysisCharacterGroup,
  type ActiveAnalysisCharacterGroup,
  type CharacterGroupBucket,
  type CharacterGroupingCandidate,
} from '@maple/db/character-group';

function sortUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, 'ko'));
}

function hasSameRepresentative(group: ActiveAnalysisCharacterGroup, bucket: CharacterGroupBucket) {
  return (group.primaryCharacterName ?? null) === (bucket.primaryCharacterName ?? null);
}

function isSubset(subset: string[], superset: string[]) {
  const supersetSet = new Set(superset);
  return subset.every((value) => supersetSet.has(value));
}

function hasNameOverlap(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.some((value) => rightSet.has(value));
}

function buildBucketNameSnapshot(bucket: CharacterGroupBucket) {
  return sortUnique(bucket.members.map((member) => member.characterName));
}

function buildGroupBuckets(candidates: CharacterGroupingCandidate[]) {
  const buckets = new Map<string, CharacterGroupBucket>();

  for (const candidate of candidates) {
    const current = buckets.get(candidate.accountKey);

    if (!current) {
      buckets.set(candidate.accountKey, {
        accountKey: candidate.accountKey,
        worldName: candidate.worldName,
        primaryCharacterName: candidate.primaryCharacterName,
        representativeOcidRowId: candidate.representativeOcidRowId ?? (candidate.isPrimaryCharacter ? candidate.ocidRowId : null),
        unionLevel: candidate.unionLevel,
        unionPower: candidate.unionPower,
        rankingDate: candidate.rankingDate,
        members: [
          {
            ocidRowId: candidate.ocidRowId,
            characterName: candidate.queriedCharacterName,
            role: candidate.isPrimaryCharacter ? 'main' : 'sub',
          },
        ],
      });
      continue;
    }

    current.members.push({
      ocidRowId: candidate.ocidRowId,
      characterName: candidate.queriedCharacterName,
      role: candidate.isPrimaryCharacter ? 'main' : 'sub',
    });

    if (!current.primaryCharacterName && candidate.primaryCharacterName) {
      current.primaryCharacterName = candidate.primaryCharacterName;
    }

    if (!current.representativeOcidRowId && candidate.representativeOcidRowId) {
      current.representativeOcidRowId = candidate.representativeOcidRowId;
    }

    if (!current.representativeOcidRowId && candidate.isPrimaryCharacter) {
      current.representativeOcidRowId = candidate.ocidRowId;
    }

    if (candidate.rankingDate > current.rankingDate) {
      current.rankingDate = candidate.rankingDate;
    }
  }

  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    members: bucket.members.sort((left, right) => left.characterName.localeCompare(right.characterName, 'ko')),
  }));
}

function findMatchingActiveGroup(bucket: CharacterGroupBucket, activeGroups: ActiveAnalysisCharacterGroup[]) {
  const bucketNames = buildBucketNameSnapshot(bucket);

  return activeGroups.find((group) => {
    if (group.worldName !== bucket.worldName) {
      return false;
    }

    if (!hasSameRepresentative(group, bucket)) {
      return false;
    }

    return isSubset(group.memberNamesSnapshot, bucketNames);
  });
}

function findSupersededGroupCandidate(bucket: CharacterGroupBucket, activeGroups: ActiveAnalysisCharacterGroup[]) {
  const bucketNames = buildBucketNameSnapshot(bucket);

  return activeGroups.find((group) => {
    if (group.worldName !== bucket.worldName) {
      return false;
    }

    if (hasSameRepresentative(group, bucket)) {
      return true;
    }

    return hasNameOverlap(group.memberNamesSnapshot, bucketNames);
  });
}

/** INFO:
 * union-ranking 저장 결과를 accountKey 기준으로 계정 그룹으로 묶는다.
 * - 같은 accountKey는 같은 계정 그룹으로 확정한다.
 * - 대표 캐릭터와 멤버 스냅샷이 같으면 기존 active 그룹을 갱신한다.
 * - 구조 변화가 있으면 기존 그룹을 superseded로 전환하고 새 버전을 만든다.
 **/
export async function buildCharacterAccountGroups() {
  const candidates = await findCharacterGroupingCandidates();
  const buckets = buildGroupBuckets(candidates);
  const activeGroups = await findActiveAnalysisCharacterGroups();

  let createdGroupCount = 0;
  let updatedGroupCount = 0;
  let supersededGroupCount = 0;
  let assignedCharacterCount = 0;

  for (const bucket of buckets) {
    const exactMatch = findMatchingActiveGroup(bucket, activeGroups);

    if (exactMatch) {
      const updated = await updateActiveAnalysisCharacterGroup(exactMatch.id, exactMatch.members, bucket);
      updatedGroupCount += 1;
      assignedCharacterCount += updated.memberCount;
      continue;
    }

    const supersededCandidate = findSupersededGroupCandidate(bucket, activeGroups);

    if (supersededCandidate) {
      await markCharacterGroupSuperseded(supersededCandidate.id);
      supersededGroupCount += 1;
    }

    await createCharacterGroupVersion(bucket, supersededCandidate?.id);
    createdGroupCount += 1;
    assignedCharacterCount += bucket.members.length;
  }

  const result = {
    candidateCount: candidates.length,
    groupCount: createdGroupCount + updatedGroupCount,
    createdGroupCount,
    updatedGroupCount,
    supersededGroupCount,
    assignedCharacterCount,
  };

  logger.info(
    {
      candidateCount: result.candidateCount,
      groupCount: result.groupCount,
      assignedCharacterCount: result.assignedCharacterCount,
      createdGroupCount: result.createdGroupCount,
      updatedGroupCount: result.updatedGroupCount,
      supersededGroupCount: result.supersededGroupCount,
    },
    'character account groups rebuilt',
  );

  return result;
}
