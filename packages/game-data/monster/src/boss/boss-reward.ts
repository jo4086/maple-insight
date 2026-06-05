import type { BossDifficultyOf } from './boss-difficulty';
import type { BossName } from './boss-name';

export type BossRewardMesoTable = {
  [TBossName in BossName]?: Partial<Record<BossDifficultyOf<TBossName>, number>>;
};

export const bossRewardMesoMap = {
  자쿰: {
    easy: 114_000,
    normal: 349_000,
    chaos: 8_080_000,
  },
  매그너스: {
    easy: 411_000,
    normal: 1_480_000,
    hard: 8_560_000,
  },
  힐라: {
    normal: 455_000,
    hard: 5_750_000,
  },
  파풀라투스: {
    easy: 390_000,
    normal: 1_520_000,
    chaos: 13_800_000,
  },
  반반: {
    normal: 551_000,
    chaos: 8_150_000,
  },
  피에르: {
    normal: 551_000,
    chaos: 8_170_000,
  },
  '블러디 퀸': {
    normal: 551_000,
    chaos: 8_140_000,
  },
  벨룸: {
    normal: 551_000,
    chaos: 9_280_000,
  },
  핑크빈: {
    normal: 799_000,
    chaos: 6_580_000,
  },
  시그너스: {
    easy: 4_550_000,
    normal: 7_500_000,
  },
  스우: {
    normal: 17_600_000,
    hard: 54_200_000,
    extreme: 604_000_000,
  },
  데미안: {
    normal: 18_400_000,
    hard: 51_500_000,
  },
  '가디언 엔젤 슬라임': {
    normal: 26_800_000,
    chaos: 79_100_000,
  },
  루시드: {
    easy: 31_400_000,
    normal: 37_500_000,
    hard: 66_200_000,
  },
  윌: {
    easy: 34_000_000,
    normal: 43_300_000,
    hard: 81_200_000,
  },
  더스크: {
    normal: 46_300_000,
    chaos: 73_500_000,
  },
  듄켈: {
    normal: 50_000_000,
    hard: 99_400_000,
  },
  '진 힐라': {
    normal: 74_900_000,
    hard: 112_000_000,
  },
  '검은 마법사': {
    hard: 700_000_000,
    extreme: 9_200_000_000,
  },
  '선택받은 세렌': {
    normal: 266_000_000,
    hard: 396_000_000,
    extreme: 3_150_000_000,
  },
  '감시자 칼로스': {
    easy: 311_000_000,
    normal: 561_000_000,
    chaos: 1_340_000_000,
    extreme: 4_320_000_000,
  },
  '최초의 대적자': {
    easy: 324_000_000,
    normal: 589_000_000,
    hard: 1_510_000_000,
    extreme: 4_960_000_000,
  },
  카링: {
    easy: 419_000_000,
    normal: 714_000_000,
    hard: 1_830_000_000,
    extreme: 5_670_000_000,
  },
  '찬란한 흉성': {
    normal: 658_000_000,
    hard: 2_819_000_000,
  },
  림보: {
    normal: 1_080_000_000,
    hard: 2_510_000_000,
  },
  발드릭스: {
    normal: 1_440_000_000,
    hard: 3_240_000_000,
  },
  유피테르: {
    normal: 1_700_000_000,
    hard: 5_100_000_000,
  },
} as const satisfies BossRewardMesoTable;
