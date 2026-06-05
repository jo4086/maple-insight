export const CHARACTER_ITEM_EQUIPMENT_CONTRACT = {
  endpoint: '/character/item-equipment',
  requiredParams: ['ocid'] as const,
  optionalParams: ['date'] as const,
} as const;
