import { prisma } from '@/lib/prisma';

export async function findGameJobsByVersion(version: string) {
  return prisma.gameJob.findMany({
    where: { version },
    select: { jobId: true, jobName: true },
    orderBy: [{ jobId: 'asc' }],
  });
}

export async function findGlobalWeaponTypes() {
  return prisma.weaponType.findMany({
    select: {
      id: true,
      category: true,
      part: true,
      normalizedPart: true,
      classGroupKeys: true,
      handType: true,
      weaponConstant: true,
    },
    orderBy: [{ category: 'asc' }, { part: 'asc' }, { id: 'asc' }],
  });
}
