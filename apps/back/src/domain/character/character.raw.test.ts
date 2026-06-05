import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';

import type { AndroidRaw, ItemEquipmentRaw } from '@maple/api-character';
import { EquipmentSlot } from '@maple/contracts';
import { isAxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import type { CharacterApiEndpoint, CharacterEndpoint, CharacterSkillGrade } from './character.constants';
import { CharacterService, getCharacterOCID } from './character.service';
import { toCharacterEquipment } from './mappers/item-equipment.mapper';

type ItemEquipmentDebugPayload = {
  preset_no: number | null;
  item_count: number;
  has_selected_item: boolean;
  search_item_slot: string | null;
  selected_item: unknown;
};

const RAW_DEBUG_CONFIG: {
  nick: string;
  date: string | null;
  endpoint: CharacterEndpoint;
  itemSlot: EquipmentSlot;
  skillGrade: CharacterSkillGrade;
} = {
  nick: '토끼멜리',
  date: null,
  endpoint: 'equipment',
  itemSlot: '모자',
  skillGrade: '6',
};

const color = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const runTest = RAW_DEBUG_CONFIG.nick ? it : it.skip;
const DEBUG_DIR = path.resolve(process.cwd(), 'src/domain/character/debug');
const TEST_LOG_PATH = path.join(DEBUG_DIR, 'test.log');

type ItemArrayForDebug = ItemEquipmentRaw['item_equipment'] | ItemEquipmentRaw['item_equipment_preset_1'];

function selectItemByConfig(items: ItemArrayForDebug) {
  if (!items?.length) return null;
  if (!RAW_DEBUG_CONFIG.itemSlot) return items;

  return items.find((item) => item?.item_equipment_slot === RAW_DEBUG_CONFIG.itemSlot) ?? null;
}

function toDebugPayload(endpoint: CharacterEndpoint, raw: unknown): ItemEquipmentDebugPayload | unknown {
  if (endpoint !== 'item-equipment' || !raw || typeof raw !== 'object') {
    return raw;
  }

  const itemRaw = raw as ItemEquipmentRaw;
  const currentItems = itemRaw.item_equipment ?? null;
  const selectedItem = selectItemByConfig(currentItems);

  return {
    preset_no: itemRaw.preset_no,
    item_count: currentItems?.length ?? 0,
    has_selected_item: selectedItem != null,
    search_item_slot: RAW_DEBUG_CONFIG.itemSlot,
    selected_item: selectedItem,
  };
}

function isItemEquipmentDebugPayload(payload: unknown): payload is ItemEquipmentDebugPayload {
  if (!payload || typeof payload !== 'object') return false;

  return 'preset_no' in payload && 'item_count' in payload && 'has_selected_item' in payload && 'search_item_slot' in payload && 'selected_item' in payload;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getVersionOrder(file: string, baseFileName: string, escapedBaseName: string) {
  if (file === baseFileName) return 0;

  const match = file.match(new RegExp(`^${escapedBaseName}-(\\d+)\\.json$`));
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

async function appendTestLog(label: string, payload: unknown) {
  await fs.mkdir(DEBUG_DIR, { recursive: true });

  const lines = [`[${new Date().toISOString()}] ${label}`, JSON.stringify(payload, null, 2), ''].join('\n');

  await fs.appendFile(TEST_LOG_PATH, lines, 'utf-8');
}

async function writeVersionedDebugJson(nick: string, endpoint: CharacterEndpoint, payload: unknown) {
  await fs.mkdir(DEBUG_DIR, { recursive: true });

  const baseFileName = `${nick}-${endpoint}.json`;
  const nextContent = `${JSON.stringify(payload, null, 2)}\n`;
  const files = await fs.readdir(DEBUG_DIR);
  const escapedBaseName = escapeRegExp(`${nick}-${endpoint}`);
  const matchedFiles = files
    .filter((file) => file === baseFileName || new RegExp(`^${escapedBaseName}-(\\d+)\\.json$`).test(file))
    .sort((a, b) => getVersionOrder(a, baseFileName, escapedBaseName) - getVersionOrder(b, baseFileName, escapedBaseName));

  for (const file of matchedFiles) {
    const filePath = path.join(DEBUG_DIR, file);
    const currentContent = await fs.readFile(filePath, 'utf-8');

    if (currentContent === nextContent) {
      await appendTestLog('json unchanged', { nick, endpoint, filePath });
      return filePath;
    }
  }

  const basePath = path.join(DEBUG_DIR, baseFileName);

  try {
    await fs.access(basePath);
  } catch {
    await fs.writeFile(basePath, nextContent, 'utf-8');
    await appendTestLog('json saved', { nick, endpoint, filePath: basePath });
    return basePath;
  }

  let version = 1;
  while (true) {
    const versionedPath = path.join(DEBUG_DIR, `${nick}-${endpoint}-${version}.json`);

    try {
      await fs.access(versionedPath);
      version += 1;
    } catch {
      await fs.writeFile(versionedPath, nextContent, 'utf-8');
      await appendTestLog('json saved', { nick, endpoint, filePath: versionedPath });
      return versionedPath;
    }
  }
}

function serializeError(error: unknown, context: Record<string, unknown>) {
  if (isAxiosError(error)) {
    return {
      ...context,
      type: 'AxiosError',
      message: error.message,
      code: error.code,
      status: error.response?.status ?? null,
      responseData: error.response?.data ?? null,
      request: {
        method: error.config?.method ?? null,
        baseURL: error.config?.baseURL ?? null,
        url: error.config?.url ?? null,
        params: error.config?.params ?? null,
      },
    };
  }

  if (error instanceof Error) {
    return {
      ...context,
      type: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }

  return {
    ...context,
    type: 'UnknownError',
    error,
  };
}

async function callEndpointForDebug(service: CharacterService, endpoint: CharacterEndpoint) {
  if (endpoint === 'equipment') {
    const itemEquipmentRaw = await service.call('item-equipment');
    const androidEquipmentRaw = await service.call('android-equipment');

    return toCharacterEquipment(itemEquipmentRaw as ItemEquipmentRaw, androidEquipmentRaw as AndroidRaw);
  }

  if (endpoint === 'skill') {
    return service.call({
      endpoint: 'skill',
      key: `skill-${RAW_DEBUG_CONFIG.skillGrade}`,
      params: {
        character_skill_grade: RAW_DEBUG_CONFIG.skillGrade,
      },
    });
  }

  return service.call(endpoint as CharacterApiEndpoint);
}

describe('character raw endpoint debug 2', () => {
  runTest(
    'fetches selected character raw data and logs execution context',
    async () => {
      let itemSummary: ItemEquipmentDebugPayload | null = null;

      await appendTestLog('test started', {
        config: RAW_DEBUG_CONFIG,
      });

      try {
        const { ocid } = await getCharacterOCID(RAW_DEBUG_CONFIG.nick);
        const service = new CharacterService(ocid, RAW_DEBUG_CONFIG.date);

        await appendTestLog('ocid lookup succeeded', {
          input_nick: RAW_DEBUG_CONFIG.nick,
          ocid,
        });

        try {
          const basicRaw = await service.call('basic');
          const resolvedCharacterName =
            basicRaw && typeof basicRaw === 'object' && 'character_name' in basicRaw ? ((basicRaw as { character_name?: string }).character_name ?? null) : null;

          await appendTestLog('nickname verification', {
            input_nick: RAW_DEBUG_CONFIG.nick,
            resolved_character_name: resolvedCharacterName,
            is_exact_match: resolvedCharacterName === RAW_DEBUG_CONFIG.nick,
          });
        } catch (error) {
          await appendTestLog(
            'nickname verification failed',
            serializeError(error, {
              functionName: 'service.call',
              endpoint: 'basic',
              params: {
                ocid,
                date: RAW_DEBUG_CONFIG.date,
              },
            }),
          );

          throw error;
        }

        try {
          const raw = await callEndpointForDebug(service, RAW_DEBUG_CONFIG.endpoint);
          const payload = toDebugPayload(RAW_DEBUG_CONFIG.endpoint, raw);

          if (RAW_DEBUG_CONFIG.endpoint === 'item-equipment' && isItemEquipmentDebugPayload(payload)) {
            itemSummary = payload;
          }

          await writeVersionedDebugJson(RAW_DEBUG_CONFIG.nick, RAW_DEBUG_CONFIG.endpoint, payload);

          await appendTestLog('endpoint fetch succeeded', {
            endpoint: RAW_DEBUG_CONFIG.endpoint,
            ocid,
            input: {
              nick: RAW_DEBUG_CONFIG.nick,
              date: RAW_DEBUG_CONFIG.date,
              skillGrade: RAW_DEBUG_CONFIG.skillGrade,
              itemSlot: RAW_DEBUG_CONFIG.itemSlot,
            },
          });

          expect(raw).toBeTruthy();
        } catch (error) {
          await appendTestLog(
            'endpoint fetch failed',
            serializeError(error, {
              functionName: RAW_DEBUG_CONFIG.endpoint === 'equipment' ? 'callEndpointForDebug -> toCharacterEquipment' : 'service.call',
              endpoint: RAW_DEBUG_CONFIG.endpoint,
              params: {
                nick: RAW_DEBUG_CONFIG.nick,
                date: RAW_DEBUG_CONFIG.date,
                ocid,
                skillGrade: RAW_DEBUG_CONFIG.skillGrade,
                itemSlot: RAW_DEBUG_CONFIG.itemSlot,
              },
            }),
          );

          throw error;
        }

        if (itemSummary) {
          await appendTestLog('item summary', {
            endpoint: RAW_DEBUG_CONFIG.endpoint,
            nick: RAW_DEBUG_CONFIG.nick,
            has_selected_item: itemSummary.has_selected_item,
            search_item_slot: itemSummary.search_item_slot,
            preset_no: itemSummary.preset_no,
            item_count: itemSummary.item_count,
          });
        }

        console.log(`${color.green}[character raw debug completed]${color.reset}`);
      } catch (error) {
        await appendTestLog(
          'test failed',
          serializeError(error, {
            functionName: 'character-2.raw.test',
            config: RAW_DEBUG_CONFIG,
          }),
        );

        console.log(`${color.red}[character raw debug failed]${color.reset}`);
        throw error;
      }
    },
    30_000,
  );
});
