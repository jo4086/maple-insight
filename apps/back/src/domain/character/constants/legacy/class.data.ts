export type JobGroup = 'warrior' | 'mage' | 'archer' | 'thief' | 'pirate' | 'etc';
export type JobAffiliation = 'Adventurer' | 'Cygnus' | 'Heroes' | 'Resistance' | 'Nova' | 'Lef' | 'Anima' | 'Overlord' | 'Friends';

export interface JobMeta {
  code: string;
  name: string;
  group: JobGroup;
  affiliation: JobAffiliation;
}

export const JobMetaMap: Record<string, JobMeta> = {
  hero: { code: '011', name: 'hero', group: 'warrior', affiliation: 'Adventurer' },
  paladin: { code: '012', name: 'paladin', group: 'warrior', affiliation: 'Adventurer' },
  darkNight: { code: '013', name: 'darkNight', group: 'warrior', affiliation: 'Adventurer' },
  archMageFire: { code: '021', name: 'archMageFire', group: 'mage', affiliation: 'Adventurer' },
  archMageIce: { code: '022', name: 'archMageIce', group: 'mage', affiliation: 'Adventurer' },
  bishop: { code: '023', name: 'bishop', group: 'mage', affiliation: 'Adventurer' },
  bowMaster: { code: '031', name: 'bowMaster', group: 'archer', affiliation: 'Adventurer' },
  marksman: { code: '032', name: 'marksman', group: 'archer', affiliation: 'Adventurer' },
  pathfinder: { code: '033', name: 'pathfinder', group: 'archer', affiliation: 'Adventurer' },
  nightLord: { code: '041', name: 'nightLord', group: 'thief', affiliation: 'Adventurer' },
  shadower: { code: '042', name: 'shadower', group: 'thief', affiliation: 'Adventurer' },
  dualBlader: { code: '043', name: 'dualBlader', group: 'thief', affiliation: 'Adventurer' },
  viper: { code: '051', name: 'viper', group: 'pirate', affiliation: 'Adventurer' },
  captain: { code: '052', name: 'captain', group: 'pirate', affiliation: 'Adventurer' },
  cannonShooter: { code: '053', name: 'cannonShooter', group: 'pirate', affiliation: 'Adventurer' },
  soulMaster: { code: '111', name: 'soulMaster', group: 'warrior', affiliation: 'Cygnus' },
  mikhail: { code: '112', name: 'mikhail', group: 'warrior', affiliation: 'Cygnus' },
  flameWizard: { code: '121', name: 'flameWizard', group: 'mage', affiliation: 'Cygnus' },
  windBreaker: { code: '131', name: 'windBreaker', group: 'archer', affiliation: 'Cygnus' },
  nightWalker: { code: '141', name: 'nightWalker', group: 'thief', affiliation: 'Cygnus' },
  striker: { code: '151', name: 'striker', group: 'pirate', affiliation: 'Cygnus' },
  aran: { code: '211', name: 'aran', group: 'warrior', affiliation: 'Heroes' },
  evan: { code: '221', name: 'evan', group: 'mage', affiliation: 'Heroes' },
  luminous: { code: '222', name: 'luminous', group: 'mage', affiliation: 'Heroes' },
  mercedes: { code: '231', name: 'mercedes', group: 'archer', affiliation: 'Heroes' },
  phantom: { code: '241', name: 'phantom', group: 'thief', affiliation: 'Heroes' },
  eunwol: { code: '251', name: 'eunwol', group: 'pirate', affiliation: 'Heroes' },
  demonSlayer: { code: '311', name: 'demonSlayer', group: 'warrior', affiliation: 'Resistance' },
  demonAvenger: { code: '312', name: 'demonAvenger', group: 'warrior', affiliation: 'Resistance' },
  blaster: { code: '313', name: 'blaster', group: 'warrior', affiliation: 'Resistance' },
  battleMage: { code: '321', name: 'battleMage', group: 'mage', affiliation: 'Resistance' },
  wildHunter: { code: '331', name: 'wildHunter', group: 'archer', affiliation: 'Resistance' },
  mechanic: { code: '351', name: 'mechanic', group: 'pirate', affiliation: 'Resistance' },
  xenon: { code: '361', name: 'xenon', group: 'pirate', affiliation: 'Resistance' },
  kaiser: { code: '411', name: 'kaiser', group: 'warrior', affiliation: 'Nova' },
  kain: { code: '431', name: 'kain', group: 'archer', affiliation: 'Nova' },
  cadena: { code: '441', name: 'cadena', group: 'thief', affiliation: 'Nova' },
  angelicBuster: { code: '451', name: 'angelicBuster', group: 'pirate', affiliation: 'Nova' },
  adele: { code: '511', name: 'adele', group: 'warrior', affiliation: 'Lef' },
  illium: { code: '521', name: 'illium', group: 'mage', affiliation: 'Lef' },
  khali: { code: '541', name: 'khali', group: 'thief', affiliation: 'Lef' },
  ark: { code: '551', name: 'ark', group: 'pirate', affiliation: 'Lef' },
  len: { code: '611', name: 'len', group: 'warrior', affiliation: 'Anima' },
  lara: { code: '621', name: 'lara', group: 'mage', affiliation: 'Anima' },
  hoYoung: { code: '641', name: 'hoYoung', group: 'thief', affiliation: 'Anima' },
  zero: { code: '1011', name: 'zero', group: 'warrior', affiliation: 'Overlord' },
  kinesis: { code: '2021', name: 'kinesis', group: 'mage', affiliation: 'Friends' },
};
