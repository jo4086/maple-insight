import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '@/lib/prisma';

const DEFAULT_CHUNK_SIZE = 1000;

type EquipmentJsonItem = {
  name: string;
  category: string;
  keywords: string[];
  part: string;
  setName: string | null;
  luckyFlag: boolean;
  potentialEnabled: boolean;
  starforceEnabled: boolean;
  scrollUpgradeEnabled: boolean;
  addOptionEnabled: boolean;
  requiredLevel: number | null;
  requiredClass: string | readonly string[];
  classGroup: string | null;
  handType: string | null;
  weaponConstant: number | null;
  str: number;
  dex: number;
  int: number;
  luk: number;
  maxHp: number;
  maxMp: number;
  maxHpRate: number;
  maxMpRate: number;
  attackPower: number;
  magicPower: number;
  armor: number;
  bossDamage: number;
  ignoreMonsterArmor: number;
  criRate: number;
  criDamage: number;
  normalDamage: number;
  speed: number;
  jump: number;
  scrollCount: number;
  exceptionalScroll: number;
  specialRingLevel: number;
};

export type SeedEquipmentOptions = {
  /** generator/src/generated/equipment 같은 JSON 파일 디렉터리 */
  dir: string;
  /** createMany chunk 크기 */
  chunkSize?: number;
};

export type SeedEquipmentResult = {
  weapon: number;
  armor: number;
  accessory: number;
  subWeapon: number;
  total: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function chunk<T>(items: readonly T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

async function readJsonArray<T extends Record<string, unknown>>(filePath: string): Promise<T[]> {
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed) || parsed.some((record) => !isRecord(record))) {
    throw new Error(`Expected JSON array of objects: ${filePath}`);
  }

  return parsed as T[];
}

async function createManyInChunks<T>(items: readonly T[], chunkSize: number, createMany: (items: T[]) => Promise<unknown>): Promise<void> {
  for (const rowChunk of chunk(items, chunkSize)) {
    await createMany(rowChunk);
  }
}

function toEquipmentItemCreateManyInput(item: EquipmentJsonItem) {
  return {
    name: item.name,
    category: item.category,
    keywords: item.keywords,
    part: item.part,
    setName: item.setName,
    luckyFlag: item.luckyFlag,
    potentialEnabled: item.potentialEnabled,
    starforceEnabled: item.starforceEnabled,
    scrollUpgradeEnabled: item.scrollUpgradeEnabled,
    addOptionEnabled: item.addOptionEnabled,
    requiredLevel: item.requiredLevel,
    requiredClass: item.requiredClass,
    classGroup: item.classGroup,
    handType: item.handType,
    weaponConstant: item.weaponConstant,
    str: item.str,
    dex: item.dex,
    int: item.int,
    luk: item.luk,
    maxHp: item.maxHp,
    maxMp: item.maxMp,
    maxHpRate: item.maxHpRate,
    maxMpRate: item.maxMpRate,
    attackPower: item.attackPower,
    magicPower: item.magicPower,
    armor: item.armor,
    bossDamage: item.bossDamage,
    ignoreMonsterArmor: item.ignoreMonsterArmor,
    criRate: item.criRate,
    criDamage: item.criDamage,
    normalDamage: item.normalDamage,
    speed: item.speed,
    jump: item.jump,
    upgradeScroll: item.scrollCount,
    exceptionalScroll: item.exceptionalScroll,
    specialRingLevel: item.specialRingLevel,
  };
}

export async function seedEquipment(options: SeedEquipmentOptions): Promise<SeedEquipmentResult> {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const [weapon, armor, accessory, subWeapon] = await Promise.all([
    readJsonArray<EquipmentJsonItem>(path.join(options.dir, 'weapon.json')),
    readJsonArray<EquipmentJsonItem>(path.join(options.dir, 'armor.json')),
    readJsonArray<EquipmentJsonItem>(path.join(options.dir, 'accessory.json')),
    readJsonArray<EquipmentJsonItem>(path.join(options.dir, 'subWeapon.json')),
  ]);
  const items = [...weapon, ...armor, ...accessory, ...subWeapon];

  await prisma.$transaction(async (tx) => {
    await tx.equipmentItem.deleteMany();

    await createManyInChunks(
      items.map((item) => toEquipmentItemCreateManyInput(item)),
      chunkSize,
      (data) => tx.equipmentItem.createMany({ data }),
    );
  });

  return {
    weapon: weapon.length,
    armor: armor.length,
    accessory: accessory.length,
    subWeapon: subWeapon.length,
    total: items.length,
  };
}
