interface Jobs {
  wildCard: string;
  base: string[];
  warrior: string[];
  mage: string[];
  archor: string[];
  thief: string[];
  pirate: string[];
  details: {
    [key: string]: string[];
  };
}

type GroupNames = 'adventurer' | 'cygnusKnights' | 'resistance' | 'heroes';

type AdventurerJob = {
  warrior: 'hero' | 'paladin' | 'darknight';
  mage: 'arcMageFP' | 'arcMageLI' | 'bishop';
  archor: 'bowMaster' | 'marksMan' | 'pathfinder';
  thief: 'shadower' | 'nightLoad' | 'dualBlade';
  pirate: 'viper' | 'captain' | 'cannonShooter';
};

type Adventurer = {
  wildCard: '***';
  // group: ['000', '1**', '2**', '3**', '4**', '5**'];
  // details: {
  beginner: '000';
  warrior: '1**';
  mage: '2**';
  archor: '3**';
  thief: '4**';
  pirate: '5**';
  // };
};

type CygnusKnights = {
  wildCard: '****';
  noblesse: '1000';
  warrior: '11**';
  mage: '12**';
  archor: '13**';
  thief: '14**';
  pirate: '15**';
};

type Heroes = {
  wildCard: '2***';
  base: ['2000', '2001', '2002', '2003', '2004', '2005'];
  groupName: 'heroes';
  warrior: ['21**'];
  mage: ['22**', '26**'];
  archor: ['23**'];
  thief: ['24**'];
  pirate: ['25**'];

  details: {
    aran: ['2000', '21**'];
    evan: ['2001', '22**'];
    mercedes: ['2002', '23**'];
    phantom: ['2003', '24**'];
    eunwol: ['2005', '25**'];
    luminous: ['2004', '26**'];
  };
};

type Resistance = {
  wildCard: '3***';
  base: ['3000', '3001', '3002'];
  warrior: '31**';

  details: {
    demonSlayer: '311*';
    demonAvanger: '312*';
  };
};
