import { createArmorNameBuilder } from './builder';

export const rootAbyssArmorItemNames = createArmorNameBuilder('rootAbyss', {
  parts: ['hat', 'top', 'bottom'],
}).build();

export const absolabsArmorItemNames = createArmorNameBuilder('absolabs', {
  parts: ['hat', 'overall', 'gloves', 'shoes', 'cape', 'shoulder'],
}).build();

export const arcaneShadeArmorItemNames = createArmorNameBuilder('arcaneShade', {
  parts: ['hat', 'overall', 'gloves', 'shoes', 'cape', 'shoulder'],
}).build();

export const eternalArmorItemNames = createArmorNameBuilder('eternal', {
  parts: ['hat', 'top', 'bottom', 'gloves', 'shoes', 'cape', 'shoulder'],
}).build();

export const challengerArmorItemNames = createArmorNameBuilder('challenger', {
  parts: ['hat', 'top', 'bottom', 'gloves', 'shoes', 'cape', 'shoulder'],
}).build();

export const cygnusEmpressArmorItemNames = createArmorNameBuilder('cygnusEmpress', {
  parts: ['hat', 'overall', 'gloves', 'shoes', 'cape', 'shoulder'],
}).build();

export const armorItemNames = [
  ...cygnusEmpressArmorItemNames,
  ...rootAbyssArmorItemNames,
  ...absolabsArmorItemNames,
  ...challengerArmorItemNames,
  ...arcaneShadeArmorItemNames,
  ...eternalArmorItemNames,
] as const;

export type CygnusEmpressArmorItemName = (typeof cygnusEmpressArmorItemNames)[number];
export type RootAbyssArmorItemName = (typeof rootAbyssArmorItemNames)[number];
export type AbsolabsArmorItemName = (typeof absolabsArmorItemNames)[number];
export type ChallengerArmorItemName = (typeof challengerArmorItemNames)[number];
export type ArcaneShadeArmorItemName = (typeof arcaneShadeArmorItemNames)[number];
export type EternalArmorItemName = (typeof eternalArmorItemNames)[number];
export type ArmorItemName = (typeof armorItemNames)[number];
