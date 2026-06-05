import { prisma } from '@/lib/prisma';

export type ResetNonRankingDataResult = {
  characterGroupMemberCount: number;
  characterGroupCount: number;
  unionRankingCount: number;
  searchHistoryCount: number;
  ocidCount: number;
};

export async function resetNonRankingData(): Promise<ResetNonRankingDataResult> {
  return prisma.$transaction(async (tx) => {
    const characterGroupMembers = await tx.characterGroupMember.deleteMany();
    const characterGroups = await tx.characterGroup.deleteMany();
    const unionRankings = await tx.unionRanking.deleteMany();
    const searchHistories = await tx.searchHistory.deleteMany();
    const ocids = await tx.ocid.deleteMany();

    return {
      characterGroupMemberCount: characterGroupMembers.count,
      characterGroupCount: characterGroups.count,
      unionRankingCount: unionRankings.count,
      searchHistoryCount: searchHistories.count,
      ocidCount: ocids.count,
    };
  });
}
