import { adventureArcherClass, cygnusArcherClass, heroesArcherClass, novaArcherClass, resistanceArcherClass } from './archerClasses';
import { adventureMageClass, animaMageClass, cygnusMageClass, friendsMageClass, heroesMageClass, lefMageClass, resistanceMageClass } from './mageClasses';
import { adventurePirateClass, cygnusPirateClass, heroesPirateClass, lefPirateClass, novaPirateClass, resistancePirateClass } from './pirateClasses';
import { adventureThiefClass, animaThiefClass, cygnusThiefClass, heroesThiefClass, lefThiefClass, novaThiefClass, resistanceThiefClass } from './thiefClasses';
import {
  adventureWarriorClass,
  animaWarriorClass,
  cygnusWarriorClass,
  heroesWarriorClass,
  lefWarriorClass,
  novaWarriorClass,
  overlordWarriorClass,
  resistanceWarriorClass,
} from './warriorClasses';

type Affiliation = 'Adventurer' | 'Cygnus' | 'Heroes' | 'Resistance' | 'Nova' | 'Lef' | 'Anima' | 'Overlord' | 'Friends';
type JobGroup = 'warrior' | 'mage' | 'archer' | 'thief' | 'pirate';
type ProgressionMap = Record<string, string>;
type JobProgressionSource = Record<string, ProgressionMap>;

export interface ClassTreeJobMeta {
  affiliation: Affiliation;
  primaryGroup: JobGroup;
  secondaryGroups?: JobGroup[];
  progression: ProgressionMap;
}

type ClassTreeGroup = Record<string, ClassTreeJobMeta>;

function withJobMeta(
  affiliation: Affiliation,
  primaryGroup: JobGroup,
  jobs: JobProgressionSource,
  overrides: Partial<Record<string, Pick<ClassTreeJobMeta, 'secondaryGroups'>>> = {},
): ClassTreeGroup {
  return Object.fromEntries(
    Object.entries(jobs).map(([jobName, progression]) => [
      jobName,
      {
        affiliation,
        primaryGroup,
        progression,
        ...(overrides[jobName] ?? {}),
      },
    ]),
  );
}

export const classTree = {
  Adventurer: {
    warrior: withJobMeta('Adventurer', 'warrior', adventureWarriorClass),
    mage: withJobMeta('Adventurer', 'mage', adventureMageClass),
    archer: withJobMeta('Adventurer', 'archer', adventureArcherClass),
    thief: withJobMeta('Adventurer', 'thief', adventureThiefClass),
    pirate: withJobMeta('Adventurer', 'pirate', adventurePirateClass),
  },
  Cygnus: {
    warrior: withJobMeta('Cygnus', 'warrior', cygnusWarriorClass),
    mage: withJobMeta('Cygnus', 'mage', cygnusMageClass),
    archer: withJobMeta('Cygnus', 'archer', cygnusArcherClass),
    thief: withJobMeta('Cygnus', 'thief', cygnusThiefClass),
    pirate: withJobMeta('Cygnus', 'pirate', cygnusPirateClass),
  },
  Heroes: {
    warrior: withJobMeta('Heroes', 'warrior', heroesWarriorClass),
    mage: withJobMeta('Heroes', 'mage', heroesMageClass),
    archer: withJobMeta('Heroes', 'archer', heroesArcherClass),
    thief: withJobMeta('Heroes', 'thief', heroesThiefClass),
    pirate: withJobMeta('Heroes', 'pirate', heroesPirateClass),
  },
  Resistance: {
    warrior: withJobMeta('Resistance', 'warrior', resistanceWarriorClass),
    mage: withJobMeta('Resistance', 'mage', resistanceMageClass),
    archer: withJobMeta('Resistance', 'archer', resistanceArcherClass),
    thief: withJobMeta('Resistance', 'thief', resistanceThiefClass, {
      제논: { secondaryGroups: ['pirate'] },
    }),
    pirate: withJobMeta('Resistance', 'pirate', resistancePirateClass, {
      제논: { secondaryGroups: ['thief'] },
    }),
  },
  Nova: {
    warrior: withJobMeta('Nova', 'warrior', novaWarriorClass),
    mage: {},
    archer: withJobMeta('Nova', 'archer', novaArcherClass),
    thief: withJobMeta('Nova', 'thief', novaThiefClass),
    pirate: withJobMeta('Nova', 'pirate', novaPirateClass),
  },
  Lef: {
    warrior: withJobMeta('Lef', 'warrior', lefWarriorClass),
    mage: withJobMeta('Lef', 'mage', lefMageClass),
    archer: {},
    thief: withJobMeta('Lef', 'thief', lefThiefClass),
    pirate: withJobMeta('Lef', 'pirate', lefPirateClass),
  },
  Anima: {
    warrior: withJobMeta('Anima', 'warrior', animaWarriorClass),
    mage: withJobMeta('Anima', 'mage', animaMageClass),
    archer: {},
    thief: withJobMeta('Anima', 'thief', animaThiefClass),
    pirate: {},
  },
  Overlord: {
    warrior: withJobMeta('Overlord', 'warrior', overlordWarriorClass),
    mage: {},
    archer: {},
    thief: {},
    pirate: {},
  },
  Friends: {
    warrior: {},
    mage: withJobMeta('Friends', 'mage', friendsMageClass),
    archer: {},
    thief: {},
    pirate: {},
  },
} as const;
