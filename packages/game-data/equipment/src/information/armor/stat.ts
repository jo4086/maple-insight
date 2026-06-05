import { createArmorStatByParts } from './builder';

export const rootAbyssArmorStatMap = createArmorStatByParts('rootAbyss', {
  hat: {
    base: {
      stat: 40,
      maxHp: 360,
      maxMp: 360,
      attackPower: 2,
      armor: 300,
      ignoreMonsterArmor: 10,
      scrollCount: 12,
    },
    overrides: {
      '하이네스 워리어헬름': { armor: 390 },
      '하이네스 던위치햇': { armor: 180 },
    },
  },
  top: {
    base: {
      stat: 30,
      attackPower: 2,
      armor: 135,
      ignoreMonsterArmor: 5,
      scrollCount: 8,
    },
    overrides: {
      '이글아이 워리어아머': { armor: 210 },
      '이글아이 던위치로브': { armor: 120 },
    },
  },
  bottom: {
    base: {
      stat: 30,
      attackPower: 2,
      armor: 135,
      ignoreMonsterArmor: 5,
      scrollCount: 8,
    },
    overrides: {
      '트릭스터 워리어팬츠': { armor: 210 },
      '트릭스터 던위치팬츠': { armor: 120 },
    },
  },
});

export const absolabsArmorStatMap = createArmorStatByParts('absolabs', {
  hat: {
    base: {
      stat: 45,
      attackPower: 3,
      armor: 400,
      ignoreMonsterArmor: 10,
      scrollCount: 12,
    },
  },
  overall: {
    base: {
      stat: 65,
      attackPower: 5,
      armor: 300,
      scrollCount: 13,
    },
  },
  gloves: {
    base: {
      stat: 20,
      attackPower: 5,
      armor: 150,
      scrollCount: 8,
    },
  },
  shoes: {
    base: {
      stat: 20,
      attackPower: 5,
      armor: 150,
      speed: 10,
      jump: 7,
      scrollCount: 8,
    },
  },
  cape: {
    base: {
      all: 15,
      attackPower: 2,
      isOppositeAttack: true,
      armor: 250,
      scrollCount: 8,
    },
  },
  shoulder: {
    base: {
      all: 14,
      attackPower: 10,
      isOppositeAttack: true,
      armor: 100,
      scrollCount: 2,
    },
  },
});

export const arcaneShadeArmorStatMap = createArmorStatByParts('arcaneShade', {
  hat: {
    base: {
      stat: 65,
      attackPower: 7,
      armor: 600,
      ignoreMonsterArmor: 15,
      scrollCount: 12,
    },
  },
  overall: {
    base: {
      stat: 85,
      attackPower: 9,
      armor: 500,
      ignoreMonsterArmor: 10,
      scrollCount: 13,
    },
  },
  gloves: {
    base: {
      stat: 40,
      attackPower: 9,
      armor: 250,
      scrollCount: 8,
    },
  },
  shoes: {
    base: {
      stat: 40,
      attackPower: 9,
      armor: 250,
      speed: 10,
      jump: 7,
      scrollCount: 8,
    },
  },
  cape: {
    base: {
      all: 35,
      attackPower: 6,
      isOppositeAttack: true,
      armor: 450,
      scrollCount: 8,
    },
  },
  shoulder: {
    base: {
      all: 35,
      attackPower: 20,
      isOppositeAttack: true,
      armor: 300,
      scrollCount: 2,
    },
  },
});

export const eternalArmorStatMap = createArmorStatByParts('eternal', {
  hat: {
    base: {
      stat: 80,
      attackPower: 10,
      armor: 750,
      ignoreMonsterArmor: 15,
      scrollCount: 8,
    },
  },
  top: {
    base: {
      stat: 50,
      attackPower: 6,
      armor: 325,
      ignoreMonsterArmor: 5,
      scrollCount: 8,
    },
  },
  bottom: {
    base: {
      stat: 50,
      attackPower: 6,
      armor: 325,
      ignoreMonsterArmor: 5,
      scrollCount: 8,
    },
  },
  gloves: {
    base: {
      stat: 55,
      attackPower: 12,
      armor: 325,
      scrollCount: 8,
    },
  },
  shoes: {
    base: {
      stat: 55,
      attackPower: 12,
      armor: 325,
      speed: 10,
      jump: 7,
      scrollCount: 8,
    },
  },
  cape: {
    base: {
      all: 50,
      attackPower: 9,
      isOppositeAttack: true,
      armor: 600,
      scrollCount: 8,
    },
  },
  shoulder: {
    base: {
      all: 51,
      attackPower: 28,
      isOppositeAttack: true,
      armor: 450,
      scrollCount: 2,
    },
  },
});
