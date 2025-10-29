interface SkillUnit {
  base: number;
  unitPercent: number;
}
interface Advence {
  normalDamage?: SkillUnit;
  bossDamage?: SkillUnit;
  CriDamage?: SkillUnit;
  DefIgnore?: SkillUnit;
}
interface DamagePercent extends SkillUnit {
  hit: number;
  advence?: Advence;
}
interface DamageSequence {
  [key: number]: {
    percent: DamagePercent;
    atkCount: number;
    mobCount: number;
    MP: number;
  };
}
interface Skill {
  [key: string]: {
    skillName: string;
    info: {
      maxLevel: number;
      damage: DamageSequence;
    };
  };
}

const map: Skill = {
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
            advence: {
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
};
