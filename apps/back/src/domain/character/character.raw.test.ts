import 'dotenv/config';

import { EquipmentSlot } from '@maple/types';
import { describe, expect, it } from 'vitest';

import type { CharacterEndpoint } from './character.constants';
import { CharacterService, getCharacterOCID } from './character.service';
import type { ItemEquipmentRaw } from './types/item-equipment.raw';

type ItemEquipmentDebugPayload = {
  preset_no: number | null;
  item_count: number;
  has_selected_item: boolean;
  search_item_slot: string | null;
  selected_item: unknown;
};

// MEMO: 입력 데이터
const RAW_DEBUG_CONFIG: {
  nick: string;
  date: string | null;
  endpoints: CharacterEndpoint[];
  itemSlot: EquipmentSlot;
} = {
  nick: '셀궁o',
  date: null,
  endpoints: ['item-equipment', 'android-equipment'],
  itemSlot: '반지1',
};

const color = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const runTest = RAW_DEBUG_CONFIG.nick ? it : it.skip;

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

  // MEMO: 출력할 콘솔 데이터
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

describe('character raw endpoint debug', () => {
  runTest(
    'fetches selected character raw data',
    async () => {
      const { ocid } = await getCharacterOCID(RAW_DEBUG_CONFIG.nick);
      const service = new CharacterService(ocid, RAW_DEBUG_CONFIG.date);
      let itemSummary: ItemEquipmentDebugPayload | null = null;

      for (const endpoint of RAW_DEBUG_CONFIG.endpoints) {
        const raw = await service.call(endpoint);
        const payload = toDebugPayload(endpoint, raw);

        console.log(`${color.cyan}[payload json]${color.reset}`);
        console.log(JSON.stringify(payload, null, 2));

        if (endpoint === 'item-equipment' && isItemEquipmentDebugPayload(payload)) {
          itemSummary = payload;
        }

        expect(raw).toBeTruthy();
      }

      if (itemSummary) {
        console.log(`${color.cyan}[character raw] endpoint = [${RAW_DEBUG_CONFIG.endpoints.join(', ')}]
  nick: ${RAW_DEBUG_CONFIG.nick}${color.reset}`);
        console.log(`${itemSummary.has_selected_item ? color.cyan : color.red}  has_selected_item : ${itemSummary.has_selected_item}${color.reset}`);
        console.log(`${color.cyan}  search_item_slot  : ${itemSummary.has_selected_item ? color.cyan : color.red}${itemSummary.search_item_slot}${color.reset}`);
        console.log(`${color.cyan}  preset_no         : ${itemSummary.preset_no}${color.reset}`);
        console.log(`${color.cyan}  item_count        : ${itemSummary.item_count}${color.reset}`);
      }
    },
    30_000,
  );
});
