import { createArmorMetaBuilder } from './builder';
import type { AbsolabsArmorItemName, CygnusEmpressArmorItemName, RootAbyssArmorItemName, EternalArmorItemName, ArcaneShadeArmorItemName } from './name';

export const cygnusEmpressArmorMetaMap = createArmorMetaBuilder<CygnusEmpressArmorItemName>({
  setKey: 'cygnusEmpress',
  requiredLevel: 140,
})
  .addGenerated('cygnusEmpress', {
    parts: ['hat', 'shoes', 'overall', 'cape', 'gloves', 'shoulder'],
  })
  .doneStrict();

export const rootAbyssArmorMetaMap = createArmorMetaBuilder<RootAbyssArmorItemName>({
  setKey: 'rootAbyss',
  requiredLevel: 150,
})
  .addGenerated('rootAbyss', {
    parts: ['hat', 'top', 'bottom'],
  })
  .doneStrict();

export const absolabsArmorMetaMap = createArmorMetaBuilder<AbsolabsArmorItemName>({
  setKey: 'absolabs',
  requiredLevel: 160,
})
  .addGenerated('absolabs', {
    parts: ['hat', 'overall', 'gloves', 'shoes', 'cape', 'shoulder'],
  })
  .doneStrict();

export const arcaneShadeArmorMetaMap = createArmorMetaBuilder<ArcaneShadeArmorItemName>({
  setKey: 'arcaneShade',
  requiredLevel: 200,
})
  .addGenerated('arcaneShade', {
    parts: ['hat', 'overall', 'gloves', 'shoes', 'cape', 'shoulder'],
  })
  .doneStrict();

export const eternalArmorMetaMap = createArmorMetaBuilder<EternalArmorItemName>({
  setKey: 'eternal',
  requiredLevel: 250,
})
  .addGenerated('eternal', {
    parts: ['hat', 'top', 'bottom', 'gloves', 'shoes', 'cape', 'shoulder'],
  })
  .doneStrict();
