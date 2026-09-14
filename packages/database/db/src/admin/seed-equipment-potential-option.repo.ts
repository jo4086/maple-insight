import { prisma } from '@/lib/prisma';

const DEFAULT_CHUNK_SIZE = 1000;

export type EquipmentPotentialOptionTextSeedItem = {
  kind: string;
  level: number;
  part: string;
  grade: string;
  optionText: string;
};

export type SeedEquipmentPotentialOptionTextsOptions = {
  items: readonly EquipmentPotentialOptionTextSeedItem[];
  chunkSize?: number;
};

export type SeedEquipmentPotentialOptionTextsResult = {
  potential: number;
  additional: number;
  total: number;
};

function chunk<T>(items: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

function countByKind(items: readonly EquipmentPotentialOptionTextSeedItem[]) {
  return items.reduce(
    (count, item) => ({
      ...count,
      [item.kind]: (count[item.kind] ?? 0) + 1,
    }),
    {} as Record<string, number>,
  );
}

export async function seedEquipmentPotentialOptionTexts({
  items,
  chunkSize = DEFAULT_CHUNK_SIZE,
}: SeedEquipmentPotentialOptionTextsOptions): Promise<SeedEquipmentPotentialOptionTextsResult> {
  const count = countByKind(items);

  await prisma.$transaction(
    async (tx) => {
      await tx.equipmentPotentialOptionText.deleteMany();

      for (const rowChunk of chunk(items, chunkSize)) {
        await tx.equipmentPotentialOptionText.createMany({
          data: rowChunk,
        });
      }
    },
    {
      timeout: 30_000,
    },
  );

  return {
    potential: count.potential ?? 0,
    additional: count.additional ?? 0,
    total: items.length,
  };
}
