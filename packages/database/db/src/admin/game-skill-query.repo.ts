import { prisma } from '@/lib/prisma';

export type GameSkillByJobIdRow = {
  version: string;
  jobId: string;
  skillId: string;
  skillName: string;
  skillDesc: string | null;
  maxLevel: number | null;
  invisible: boolean | null;
  hyper: number | null;
  reqSkill: string | null;
  reqSkillLevel: number | null;
  reqLevel: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FindGameSkillsByJobIdsOptions = {
  version: string;
  jobIds: readonly string[];
};

export async function findGameSkillsByJobIds(options: FindGameSkillsByJobIdsOptions): Promise<GameSkillByJobIdRow[]> {
  if (options.jobIds.length === 0) {
    return [];
  }

  return prisma.gameSkill.findMany({
    where: {
      version: options.version,
      jobId: {
        in: [...options.jobIds],
      },
    },
    orderBy: [{ jobId: 'asc' }, { skillId: 'asc' }],
    select: {
      version: true,
      jobId: true,
      skillId: true,
      skillName: true,
      skillDesc: true,
      maxLevel: true,
      invisible: true,
      hyper: true,
      reqSkill: true,
      reqSkillLevel: true,
      reqLevel: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
