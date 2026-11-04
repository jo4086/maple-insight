import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ensureGameDataVersion } from './game-data-version.repo';

import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const DEFAULT_CHUNK_SIZE = 1000;

type EquipmentJsonItem = {
  name: string;
  baseName: string | null;
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
  requiredClassOverride?: string | readonly string[] | null;
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
  grantedSkills: string[];
};

export type SeedEquipmentOptions = {
  /** 게임 데이터 버전. 예: 1.2.424 */
  version: string;
  /** generator/src/generated/equipment 같은 JSON 파일 디렉터리 */
  dir: string;
  /** createMany chunk 크기 */
  chunkSize?: number;
  /** bundle이 이미 시작한 importing 버전에만 추가 적재를 허용한다. */
  importInProgress?: boolean;
};

export type SeedEquipmentResult = {
  version: string;
  weapon: number;
  armor: number;
  accessory: number;
  subWeapon: number;
  total: number;
};

type WeaponTypeCatalogRow = {
  id: bigint;
  category: string;
  normalizedPart: string;
  availabilityMode: string;
  classGroupKeys: readonly string[];
  allowedJobIds: readonly string[];
};

const legacyClassGroupLabels: Readonly<Record<string, string>> = {
  warrior: '전사',
  archer: '궁수',
  mage: '마법사',
  thief: '도적',
  pirate: '해적',
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

function catalogKey(category: string, normalizedPart: string): string {
  return `${category}\u0000${normalizedPart}`;
}

function mapEquipmentCategoryLabel(category: string): 'weapon' | 'subWeapon' | null {
  if (category === '무기') return 'weapon';
  if (category === '보조무기') return 'subWeapon';
  return null;
}

export function validateEquipmentSeedItem(item: EquipmentJsonItem): void {
  if (!['무기', '방어구', '장신구', '기타', '엠블렘/파워소스', '보조무기'].includes(item.category)) {
    throw new Error(`Unsupported equipment category: ${item.category}`);
  }
  if (typeof item.part !== 'string' || item.part.trim().length === 0) {
    throw new Error(`Invalid equipment part: ${item.name}`);
  }

  const value = item.requiredClassOverride;
  if (value === undefined || value === null) return;
  if (mapEquipmentCategoryLabel(item.category) === null) {
    throw new Error(`requiredClassOverride is unsupported for ${item.category}: ${item.name}`);
  }
  const values = typeof value === 'string' ? [value] : value;
  if (
    !Array.isArray(values) ||
    values.length === 0 ||
    values.some((entry) => typeof entry !== 'string' || entry.length === 0 || entry.trim() !== entry) ||
    new Set(values).size !== values.length
  ) {
    throw new Error(`Invalid requiredClassOverride: ${item.name}`);
  }
  if (Array.isArray(value) && value.includes('공용')) {
    throw new Error(`Invalid requiredClassOverride: ${item.name}`);
  }
}

function hasEqualRequiredClass(
  left: string | readonly string[],
  right: string | readonly string[],
): boolean {
  if (typeof left === 'string' || typeof right === 'string') return left === right;
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validateMatchedPrimaryWeapon(item: EquipmentJsonItem, row: WeaponTypeCatalogRow): void {
  if (item.requiredClassOverride !== undefined && item.requiredClassOverride !== null) {
    if (hasEqualRequiredClass(item.requiredClassOverride, item.requiredClass)) return;
    throw new Error(`requiredClassOverride does not match requiredClass: ${item.name}`);
  }

  const expected = row.availabilityMode === 'common'
    && row.classGroupKeys.length === 0
    && row.allowedJobIds.length === 0
    ? '공용'
    : row.availabilityMode === 'class_groups'
      && row.classGroupKeys.length === 1
      && row.allowedJobIds.length === 0
      ? legacyClassGroupLabels[row.classGroupKeys[0] ?? '']
      : undefined;
  if (expected !== undefined && item.requiredClass === expected) return;
  throw new Error(`requiredClass does not match weapon type availability: ${item.name}`);
}

export function matchEquipmentWeaponTypes(
  items: readonly EquipmentJsonItem[],
  catalog: readonly WeaponTypeCatalogRow[],
): Map<EquipmentJsonItem, bigint> {
  const byKey = new Map<string, WeaponTypeCatalogRow>();
  for (const row of catalog) {
    if ((row.category !== 'weapon' && row.category !== 'subWeapon') || row.normalizedPart.trim().length === 0) {
      throw new Error(`Invalid weapon type catalog key: ${row.category}/${row.normalizedPart}`);
    }
    const key = catalogKey(row.category, row.normalizedPart);
    if (byKey.has(key)) throw new Error(`Duplicate weapon type catalog key: ${row.category}/${row.normalizedPart}`);
    byKey.set(key, row);
  }

  const matches = new Map<EquipmentJsonItem, bigint>();
  const unsupported = new Set<string>();
  const hasSubWeaponCatalog = catalog.some((row) => row.category === 'subWeapon');
  for (const item of items) {
    validateEquipmentSeedItem(item);
    const category = mapEquipmentCategoryLabel(item.category);
    if (category === null) continue;
    const normalizedPart = item.part.replace(/\s+/g, '');
    const row = byKey.get(catalogKey(category, normalizedPart));
    if (row === undefined) {
      if (category === 'weapon' || hasSubWeaponCatalog) unsupported.add(`${category}/${normalizedPart}`);
    } else {
      if (category === 'weapon') validateMatchedPrimaryWeapon(item, row);
      matches.set(item, row.id);
    }
  }
  if (unsupported.size > 0) {
    throw new Error(`Unsupported weapon type catalog matches: ${[...unsupported].sort().join(', ')}`);
  }
  return matches;
}

export function assertEquipmentSeedVersion(
  version: string,
  existingStatus: string | null,
  importInProgress: boolean,
): 'create' | 'continue' {
  if (existingStatus !== null) {
    if (!importInProgress || existingStatus !== 'importing') {
      throw new Error(`Equipment seed refuses existing game data version: ${version}`);
    }
    return 'continue';
  }
  if (importInProgress) throw new Error(`Equipment seed requires importing game data version: ${version}`);
  return 'create';
}

export function toEquipmentItemCreateManyInput(item: EquipmentJsonItem, version: string, weaponTypeId: bigint | null) {
  return {
    version,
    name: item.name,
    normalizedName: item.name.replace(/\s+/g, ''),
    baseName: item.baseName,
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
    ...(item.requiredClassOverride == null
      ? {}
      : { requiredClassOverride: item.requiredClassOverride as Prisma.InputJsonValue }),
    weaponTypeId,
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
    grantedSkills: item.grantedSkills,
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
  items.forEach(validateEquipmentSeedItem);

  await prisma.$transaction(async (tx) => {
    const existingVersion = await tx.gameDataVersion.findUnique({
      where: { version: options.version },
      select: { status: true },
    });
    const versionAction = assertEquipmentSeedVersion(
      options.version,
      existingVersion?.status ?? null,
      options.importInProgress === true,
    );
    const weaponTypeCatalog = await tx.weaponType.findMany({
      select: {
        id: true,
        category: true,
        normalizedPart: true,
        availabilityMode: true,
        classGroupKeys: true,
        allowedJobIds: true,
      },
    });
    const weaponTypeMatches = matchEquipmentWeaponTypes(items, weaponTypeCatalog);

    if (versionAction === 'create') await ensureGameDataVersion(tx, options.version);
    await tx.equipmentItem.deleteMany({ where: { version: options.version } });
    await createManyInChunks(
      items.map((item) => toEquipmentItemCreateManyInput(
        item,
        options.version,
        weaponTypeMatches.get(item) ?? null,
      )),
      chunkSize,
      (data) => tx.equipmentItem.createMany({ data }),
    );
  });

  return {
    version: options.version,
    weapon: weapon.length,
    armor: armor.length,
    accessory: accessory.length,
    subWeapon: subWeapon.length,
    total: items.length,
  };
}
