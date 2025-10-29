import { AffiliationEn, JobEn } from '@maple/types';

type Meta = {
  affiliation?: AffiliationEn;
  jobCategory?: JobEn;
  type?: 'base' | 'common' | 'unique' | 'final';
  jobTree?: string;
};

type FlagType = 'l' | 'e' | 'd' | 'v' | 'h';
type JobGroup = 'w' | 'm' | 'a' | 't' | 'p' | 'c'; // 'c' = any
type Affiliation = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'c'; // 'c' = any

type FlagCode = `${FlagType}-${JobGroup}${Affiliation}-${number}`;

interface ClassInfo {
  class: string;
  extends: Meta;
  tier: string;
  parent?: number;
  children?: number[];
  root?: number;
}

const a: ClassInfo = {
  class: 'hero',
  tier: '1',
  extends: {
    affiliation: 'adventurer',
    jobCategory: 'warrior',
    type: 'unique',
    jobTree: 'hero',
  },
  root: 100,
  parent: 112,
  children: [114],
};

/* wildcard rules
 * [a-bc-****]
 * - a: [V | H]
 *   {L: 링크, E:이벤트, D:도핑, V: 5차, H: 6차}
 *
 *
 * - b: [0 | 1 | 2 | 3 | 4 | 5]
 *   => { C: 공융, W: 전사, M: 마법사, A:궁수, T:도적, P: 해적 }
 *
 * - c: 소속
 *     0: 모험가,
 *     1: 시그너스,
 *     2: 레지스탕스,
 *     3: 데몬,
 *     4: 영웅,
 *     5: 노바,
 *     6: 레프,
 *     7: 아니마,
 *     8: 초월자,
 *     9: 프렌즈,
 *     C: 상관없음
 *
 * - ****: number
 */

const sd = {
  // 전사류
  40001: {},
};
