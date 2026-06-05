import { prisma } from '@/lib/prisma';

export type CharacterGroupingCandidate = {
  ocidRowId: bigint;
  accountKey: string;
  worldName: string;
  queriedCharacterName: string;
  primaryCharacterName: string | null;
  isPrimaryCharacter: boolean | null;
  representativeOcidRowId: bigint | null;
  unionLevel: number | null;
  unionPower: number | null;
  rankingDate: string;
};

export type CharacterGroupMemberInput = {
  ocidRowId: bigint;
  characterName: string;
  role: string;
};

export type CharacterGroupBucket = {
  accountKey: string;
  worldName: string;
  primaryCharacterName: string | null;
  representativeOcidRowId: bigint | null;
  unionLevel: number | null;
  unionPower: number | null;
  rankingDate: string;
  members: CharacterGroupMemberInput[];
};

export type ActiveAnalysisCharacterGroup = {
  id: bigint;
  worldName: string;
  primaryCharacterName: string | null;
  memberNamesSnapshot: string[];
  members: CharacterGroupMemberInput[];
};

function sortUnique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, 'ko'));
}

export async function findCharacterGroupingCandidates(): Promise<CharacterGroupingCandidate[]> {
  const rows = await prisma.unionRanking.findMany({
    where: {
      accountKey: { not: null },
      worldName: { not: null },
    },
    select: {
      ocidRowId: true,
      accountKey: true,
      worldName: true,
      queriedCharacterName: true,
      primaryCharacterName: true,
      isPrimaryCharacter: true,
      representativeOcidRowId: true,
      unionLevel: true,
      unionPower: true,
      rankingDate: true,
    },
  });

  return rows.map((row) => ({
    ocidRowId: row.ocidRowId,
    accountKey: row.accountKey!,
    worldName: row.worldName!,
    queriedCharacterName: row.queriedCharacterName,
    primaryCharacterName: row.primaryCharacterName,
    isPrimaryCharacter: row.isPrimaryCharacter,
    representativeOcidRowId: row.representativeOcidRowId,
    unionLevel: row.unionLevel,
    unionPower: row.unionPower,
    rankingDate: row.rankingDate,
  }));
}

export async function findActiveAnalysisCharacterGroups(): Promise<ActiveAnalysisCharacterGroup[]> {
  const groups = await prisma.characterGroup.findMany({
    where: {
      source: 'analysis',
      status: 'active',
    },
    include: {
      members: {
        orderBy: {
          characterNameSnapshot: 'asc',
        },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    worldName: group.accountKey?.split(':')[0] ?? '',
    primaryCharacterName: group.primaryCharacterName,
    memberNamesSnapshot: sortUnique(
      Array.isArray(group.memberNamesSnapshot)
        ? group.memberNamesSnapshot.filter((value): value is string => typeof value === 'string')
        : group.members.map((member) => member.characterNameSnapshot),
    ),
    members: group.members.map((member) => ({
      ocidRowId: member.ocidRowId,
      characterName: member.characterNameSnapshot,
      role: member.role,
    })),
  }));
}

export async function markCharacterGroupSuperseded(groupId: bigint) {
  return prisma.characterGroup.update({
    where: { id: groupId },
    data: {
      status: 'superseded',
      lastValidatedAt: new Date(),
    },
  });
}

export async function createCharacterGroupVersion(bucket: CharacterGroupBucket, previousGroupId?: bigint) {
  const memberNamesSnapshot = sortUnique(bucket.members.map((member) => member.characterName));

  return prisma.$transaction(async (tx) => {
    const group = await tx.characterGroup.create({
      data: {
        previousGroupId,
        label: bucket.primaryCharacterName,
        accountKey: bucket.accountKey,
        status: 'active',
        primaryCharacterName: bucket.primaryCharacterName,
        representativeOcidRowId: bucket.representativeOcidRowId,
        memberCount: bucket.members.length,
        memberNamesSnapshot,
        unionLevel: bucket.unionLevel,
        unionPower: bucket.unionPower,
        unionRankingDate: bucket.rankingDate,
        source: 'analysis',
        confidence: 1,
        lastValidatedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    await tx.characterGroupMember.createMany({
      data: bucket.members.map((member) => ({
        groupId: group.id,
        ocidRowId: member.ocidRowId,
        characterNameSnapshot: member.characterName,
        role: member.role,
      })),
    });

    return group.id;
  });
}

export async function updateActiveAnalysisCharacterGroup(
  groupId: bigint,
  existingMembers: CharacterGroupMemberInput[],
  bucket: CharacterGroupBucket,
) {
  const memberNamesSnapshot = sortUnique(bucket.members.map((member) => member.characterName));
  const existingOcidSet = new Set(existingMembers.map((member) => member.ocidRowId.toString()));
  const newMembers = bucket.members.filter((member) => !existingOcidSet.has(member.ocidRowId.toString()));

  await prisma.$transaction(async (tx) => {
    await tx.characterGroup.update({
      where: { id: groupId },
      data: {
        label: bucket.primaryCharacterName,
        accountKey: bucket.accountKey,
        memberCount: bucket.members.length,
        memberNamesSnapshot,
        unionLevel: bucket.unionLevel,
        unionPower: bucket.unionPower,
        unionRankingDate: bucket.rankingDate,
        lastValidatedAt: new Date(),
      },
    });

    if (newMembers.length > 0) {
      await tx.characterGroupMember.createMany({
        data: newMembers.map((member) => ({
          groupId,
          ocidRowId: member.ocidRowId,
          characterNameSnapshot: member.characterName,
          role: member.role,
        })),
        skipDuplicates: true,
      });
    }
  });

  return {
    groupId,
    memberCount: bucket.members.length,
    changed: newMembers.length > 0,
  };
}
