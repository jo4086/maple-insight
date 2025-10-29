import { JobTable } from '../types/jops.type';

const jobTable: JobTable = {
  adventurer: {
    wildcards: {
      base: ['***'],
      warrior: ['1**'],
      mage: ['2**'],
      archer: ['3**'],
      thief: ['4**'],
      pirate: ['5**'],
    },
    details: {
      hero: ['11*'],
      paladin: ['12*'],
      darkKnight: ['13*'],

      archMageFP: ['21*'],
      archMageIL: ['22*'],
      bishop: ['23*'],

      bowMaster: ['31*'],
      marksman: ['32*'],
      pathfinder: ['33*'],

      nightLord: ['41*'],
      shadower: ['42*'],
      dualBlade: ['43*'],

      viper: ['51*'],
      captain: ['52*'],
      cannonShooter: ['53*'],
    },
  },

  cygnusKnights: {
    wildcards: {
      base: ['1***', '5***'],
      warrior: ['11**', '51**'],
      mage: ['12**'],
      archer: ['13**'],
      thief: ['14**'],
      pirate: ['15**'],
    },
    details: {
      soulMaster: { root: '1100', tree: ['111*'] },
      flameWizard: ['121*'],
      windBreaker: ['131*'],
      nightWalker: ['141*'],
      striker: ['151*'],
      mikhail: ['511*'],
    },
  },

  resistance: {
    wildcards: {
      base: ['3***'],
      warrior: ['31**', '37**'],
      mage: ['32**'],
      archer: ['33**'],
      pirate: ['35**'],
      xenon: ['36**'],
    },
    details: {
      demonSlayer: ['311*'],
      demonAvanger: ['312*'],
      battleMage: ['321*'],
      wildHunter: ['331*'],
      mechanic: ['351*'],
      xenon: ['361*'],
      blaster: ['371*'],
    },
  },
};
