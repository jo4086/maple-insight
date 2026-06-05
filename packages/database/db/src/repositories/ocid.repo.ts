import { prisma } from '@/lib/prisma';

export type UpsertOcidInput = {
  characterName: string;
  ocid?: string | null;
  status: string;
};

export async function upsertOcid(input: UpsertOcidInput) {
  const existingByOcid = input.ocid
    ? await prisma.ocid.findUnique({
      where: { ocid: input.ocid },
    })
    : null;

  if (existingByOcid) {
    return prisma.ocid.update({
      where: { id: existingByOcid.id },
      data: {
        characterName: input.characterName,
        ocid: input.ocid,
        status: input.status,
      },
    });
  }

  return prisma.ocid.upsert({
    where: { characterName: input.characterName },
    create: {
      characterName: input.characterName,
      ocid: input.ocid ?? null,
      status: input.status,
    },
    update: {
      ocid: input.ocid ?? null,
      status: input.status,
    },
  });
}

export async function findOcidByCharacterName(characterName: string) {
  return prisma.ocid.findUnique({
    where: { characterName },
  });
}

export async function findOcidById(id: bigint) {
  return prisma.ocid.findUnique({
    where: { id },
  });
}

export async function findOcidByOcid(ocid: string) {
  return prisma.ocid.findUnique({
    where: { ocid },
  });
}

export async function findExistingCharacterNames(characterNames: string[]) {
  if (characterNames.length === 0) {
    return new Set<string>();
  }

  const rows = await prisma.ocid.findMany({
    where: {
      characterName: {
        in: characterNames,
      },
    },
    select: {
      characterName: true,
    },
  });

  return new Set(rows.map((row) => row.characterName));
}

export async function findSearchEligibleOcids(limit: number) {
  return prisma.ocid.findMany({
    where: {
      status: 'found',
      ocid: { not: null },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
  });
}
