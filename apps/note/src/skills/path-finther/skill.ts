// 폴더 위치: src/types/skill.ts

interface SkillUnit {
  base: number;
  unitPercent: number;
}

interface Advance {
  normalDamage?: SkillUnit;
  bossDamage?: SkillUnit;
  criDamage?: SkillUnit;
  defIgnore?: SkillUnit;
}

interface DamageInfo extends SkillUnit {
  hit: number;
  advance?: Advance;
}

type ResourceType = {
  resource: 'mp' | 'hp' | 'relicGauge';
};

type LevelDamageMap = Record<
  number,
  {
    percent: DamageInfo;
    atkCount: number;
    mobCount: number;
    MP?: number;
  }
>;

type SkillMap = Record<
  string,
  {
    skillName: string;
    info: {
      maxLevel: number;
      damage: LevelDamageMap;
    };
  }
>;

const _skillData: SkillMap = {
  '0000001': {
    skillName: '카디널 디스차지 VI',
    info: {
      maxLevel: 30,
      damage: {
        1: {
          percent: {
            base: 581,
            unitPercent: 6,
            hit: 5,
            advance: {
              normalDamage: {
                base: 93,
                unitPercent: 1,
              },
            },
          },
          atkCount: 1,
          mobCount: 8,
          MP: 40,
        },
      },
    },
  },
  '0000010': {
    skillName: '콤보 어썰트 VI',
    info: {
      maxLevel: 30,
      damage: {
        1: {
          percent: {
            base: 775,
            unitPercent: 36,
            hit: 10,
          },
          atkCount: 2,
          mobCount: 4,
        },
      },
    },
  },
};
