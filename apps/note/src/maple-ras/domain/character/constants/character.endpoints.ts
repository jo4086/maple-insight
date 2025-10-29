import { CharacterEndpoint } from '../types';

export const basicEndpoints: CharacterEndpoint[] = ['basic', 'ability', 'propensity'];

export const equipmentEndpoints: CharacterEndpoint[] = ['item-equipment', 'symbol-equipment', 'set-effect'];

export const statEndpoints: CharacterEndpoint[] = ['stat', 'hyper-stat'];

// 필요하면 합치기도 가능
export const fullEndpoints: CharacterEndpoint[] = [...basicEndpoints, ...equipmentEndpoints, ...statEndpoints];
