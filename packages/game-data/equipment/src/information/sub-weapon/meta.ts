import { createSubWeaponMetaBuilder } from './builder';
import type {
  ArrowFeatherName,
  ArrowheadName,
  BlueSilverGrimoireName,
  ChainIronName,
  CharmName,
  ControllerName,
  DaggerScabbardName,
  ChargeName,
  ForceShieldName,
  JewelName,
  MagicMarbleName,
  MagnumName,
  MedalName,
  PlatinumGrimoireName,
  PowderKegName,
  RedGreenGrimoireName,
  RelicName,
  RosarioName,
  SightName,
  SoulShieldName,
  ThumbRingName,
  WristBandName,
  BallastName,
  DocumentName,
  OrbName,
  MagicArrowName,
  CardName,
  FoxMarbleName,
  NovaEssenceName,
  WeaponBeltName,
  WeaponTransmitterName,
  SoulRingName,
  BraceletName,
  MagicWingName,
  PassName,
  YeouijuName,
  NorigaeName,
  SeonchuName,
  ChessPieceName,
  CommonShieldName,
  WarriorShieldName,
  MageShieldName,
  ThiefShieldName,
  AstraShieldName,
  AstraName,
  BladeName,
} from './name';

import type { EquipmentGenerationStatInput } from '@/rule';
import type { EquipmentRequiredClass, EquipmentSet } from '@/types';

type SubWeaponBaseInput = EquipmentGenerationStatInput & {
  requiredLevel?: number;
  requiredClass?: EquipmentRequiredClass | readonly EquipmentRequiredClass[];
  setKey?: EquipmentSet | null;
};

const base = {
  normal: { stat: 10, attackPower: 3 },
  evolving: { stat: 10, attackPower: 5 },
  black: { stat: 8, attackPower: 5 },
  treasure: { requiredLevel: 110, stat: 9, attackPower: 6 },
} as const satisfies Record<string, SubWeaponBaseInput>;

export const medalMetaMap = createSubWeaponMetaBuilder<MedalName>({
  part: 'medal',
  requiredClass: '히어로',
  requiredLevel: 100,
})
  .add('버츄스 메달', { stat: 10, attackPower: 3 })
  .add('이볼빙 버츄스 메달', { stat: 10, attackPower: 5 })
  .add('블랙 메달', { stat: 8, attackPower: 5 })
  .add('메이플 트레져 메달', { requiredLevel: 110, stat: 9, attackPower: 9 })
  .doneStrict();

export const rosarioMetaMap = createSubWeaponMetaBuilder<RosarioName>({
  part: 'rosario',
  requiredClass: '팔라딘',
  requiredLevel: 100,
})
  .add('세이크리드 로자리오', base.normal)
  .add('이볼빙 세이크리드 로자리오', base.evolving)
  .add('블랙 로자리오', base.black)
  .add('메이플 트레져 로자리오', base.treasure)
  .doneStrict();

export const chainIronMetaMap = createSubWeaponMetaBuilder<ChainIronName>({
  part: 'chainIron',
  requiredClass: '다크나이트',
  requiredLevel: 100,
})
  .add('버서크 체인', base.normal)
  .add('이볼빙 버서크 체인', base.evolving)
  .add('블랙 체인', base.black)
  .add('메이플 트레져 체인', base.treasure)
  .doneStrict();

export const redGreenGrimoireMetaMap = createSubWeaponMetaBuilder<RedGreenGrimoireName>({
  part: 'grimoire',
  requiredClass: '아크메이지(불,독)',
  requiredLevel: 100,
})
  .add('적녹의 서 <종장>', base.normal)
  .add('이볼빙 적녹의 서 <종장>', base.evolving)
  .add('적녹의 서 <블랙>', base.black)
  .add('적녹의 서 <메이플 트레져>', base.treasure)
  .doneStrict();

export const blueSilverGrimoireMetaMap = createSubWeaponMetaBuilder<BlueSilverGrimoireName>({
  part: 'grimoire',
  requiredClass: '아크메이지(썬,콜)',
  requiredLevel: 100,
})
  .add('청은의 서 <종장>', base.normal)
  .add('이볼빙 청은의 서 <종장>', base.evolving)
  .add('청은의 서 <블랙>', base.black)
  .add('청은의 서 <메이플 트레져>', base.treasure)
  .doneStrict();

export const platinumGrimoireMetaMap = createSubWeaponMetaBuilder<PlatinumGrimoireName>({
  part: 'grimoire',
  requiredClass: '비숍',
  requiredLevel: 100,
})
  .add('백금의 서 <종장>', base.normal)
  .add('이볼빙 백금의 서 <종장>', base.evolving)
  .add('백금의 서 <블랙>', base.black)
  .add('백금의 서 <메이플 트레져>', base.treasure)
  .doneStrict();

export const arrowFeatherMetaMap = createSubWeaponMetaBuilder<ArrowFeatherName>({
  part: 'arrowFeather',
  requiredClass: '보우마스터',
  requiredLevel: 100,
})
  .add('블라스트 페더', base.normal)
  .add('이볼빙 블라스트 페더', base.evolving)
  .add('블랙 페더', base.black)
  .add('메이플 트레져 페더', base.treasure)
  .doneStrict();

export const thumbRingMetaMap = createSubWeaponMetaBuilder<ThumbRingName>({
  part: 'thumbRing',
  requiredClass: '신궁',
  requiredLevel: 100,
})
  .add('전발적중', base.normal)
  .add('이볼빙 전발적중', base.evolving)
  .add('블랙 전발적중', base.black)
  .add('메이플 트레져 전발적중', base.treasure)
  .doneStrict();

export const relicMetaMap = createSubWeaponMetaBuilder<RelicName>({
  part: 'relic',
  requiredClass: '패스파인더',
  requiredLevel: 100,
})
  .add('퍼펙트 렐릭', base.normal)
  .add('이볼빙 퍼펙트 렐릭', base.evolving)
  .add('블랙 렐릭', base.black)
  .doneStrict();

export const charmMetaMap = createSubWeaponMetaBuilder<CharmName>({
  part: 'charm',
  requiredClass: '나이트로드',
  requiredLevel: 100,
})
  .add('파사부', base.normal)
  .add('이볼빙 파사부', base.evolving)
  .add('블랙 파사부', base.black)
  .add('메이플 트레져 파사부', base.treasure)
  .doneStrict();

export const daggerScabbardMetaMap = createSubWeaponMetaBuilder<DaggerScabbardName>({
  part: 'daggerScabbard',
  requiredClass: '섀도어',
  requiredLevel: 100,
})
  .add('슬래싱 섀도우', base.normal)
  .add('이볼빙 슬래싱 섀도우', base.evolving)
  .add('블랙 섀도우', base.black)
  .add('메이플 트레져 섀도우', base.treasure)
  .doneStrict();

export const bladeMetaMap = createSubWeaponMetaBuilder<BladeName>(
  {
    part: 'blade',
    requiredClass: '듀얼블레이더',
    capability: {
      starforceEnabled: true,
      scrollUpgradeEnabled: true,
    },
  },
  { scrollCount: 8 },
)
  .add('무명도', { requiredLevel: 20, attackPower: 20 })
  .add('설지도', { requiredLevel: 20, attackPower: 25 })
  .add('지천도', { requiredLevel: 30, attackPower: 25 })
  .add('메이플 블레이드', { requiredLevel: 35, attackPower: 29 })
  .add('의천도', { requiredLevel: 40, attackPower: 31 })
  .add('메이플 듀크', { requiredLevel: 43, attackPower: 32 })
  .add('패왕도', { requiredLevel: 50, attackPower: 34 })
  .add('화설지도', { requiredLevel: 50, attackPower: 40 })
  .add('아슈켈론', { requiredLevel: 60, attackPower: 40 })
  .add('메이플 크릿트', { requiredLevel: 64, attackPower: 42 })
  .add('천무도', { requiredLevel: 70, attackPower: 43 })
  .add('레드 블레이드', { requiredLevel: 75, attackPower: 45 })
  .add('메이플 파이롭 블레이드', { requiredLevel: 77, attackPower: 46 })
  .add('용화도', { requiredLevel: 80, attackPower: 47 })
  .add('만혈도', { requiredLevel: 90, attackPower: 48 })
  .add('유성도', { requiredLevel: 100, attackPower: 52 })
  .add('11주년 세인트 블레이드', { requiredLevel: 100, attackPower: 35, scrollCount: 4 })
  .add('블랙 블레이드', { requiredLevel: 100, attackPower: 54 })
  .add('용연도', { requiredLevel: 105, attackPower: 53 })
  .add('청월도', { requiredLevel: 110, attackPower: 54 })
  .add('자쿰의 포이즈닉 블레이드', { requiredLevel: 110, attackPower: 54 })
  .add('드래고닉 용연도', { requiredLevel: 110, attackPower: 58, scrollCount: 9 })
  .add('네크로 블레이드', { requiredLevel: 120, attackPower: 57 })
  .add('리버스 코션', { requiredLevel: 120, attackPower: 57 })
  .add('브히제르 블레이드', { requiredLevel: 120, attackPower: 57 })
  .add('타임리스 코션', { requiredLevel: 120, attackPower: 58 })
  .add('메이플 트레져 블레이드', { requiredLevel: 120, attackPower: 54 })
  .add('어비스 코션', { requiredLevel: 125, attackPower: 60, luk: 9, dex: 4 })
  .add('피어리스 코션', { requiredLevel: 125, attackPower: 61, luk: 11, dex: 4 })
  .add('쟈이힌 블레이드', { requiredLevel: 130, attackPower: 60 })
  .add('홍화청매도', { requiredLevel: 130, attackPower: 60, luk: 5, dex: 5 })
  .add('우트가르드 블레이드', { requiredLevel: 140, attackPower: 63 })
  .add('레이븐혼 섀도우블레이드', { requiredLevel: 140, attackPower: 65, luk: 10 })
  .add('스칼렛 블레이드', { requiredLevel: 145, attackPower: 72, luk: 10 })
  .add('마이스터 블레이드', { requiredLevel: 145, attackPower: 76, luk: 15 })
  .add('파프니르 래피드엣지', { requiredLevel: 150, attackPower: 71, luk: 30, scrollCount: 9 })
  .add('앱솔랩스 블레이드', { requiredLevel: 160, attackPower: 97, luk: 40, scrollCount: 9 })
  .add('아케인셰이드 블레이드', { requiredLevel: 200, attackPower: 140, luk: 65, scrollCount: 9 })
  .doneStrict();

export const wristBandMetaMap = createSubWeaponMetaBuilder<WristBandName>({
  part: 'wristBand',
  requiredClass: '바이퍼',
  requiredLevel: 100,
})
  .add('리스트 아머', base.normal)
  .add('이볼빙 리스트 아머', base.evolving)
  .add('블랙 리스트 아머', base.black)
  .add('메이플 트레져 리스트아머', base.treasure)
  .doneStrict();

export const sightMetaMap = createSubWeaponMetaBuilder<SightName>({
  part: 'sight',
  requiredClass: '캡틴',
  requiredLevel: 100,
})
  .add('팔콘아이', base.normal)
  .add('이볼빙 팔콘아이', base.evolving)
  .add('블랙 팔콘아이', base.black)
  .add('메이플 트레져 팔콘아이', base.treasure)
  .doneStrict();

export const powderKegMetaMap = createSubWeaponMetaBuilder<PowderKegName>({
  part: 'powderKeg',
  requiredClass: '캐논마스터',
  requiredLevel: 100,
})
  .add('봄버드 센터파이어', base.normal)
  .add('이볼빙 봄버드 센터파이어', base.evolving)
  .add('블랙 센터파이어', base.black)
  .add('메이플 트레져 센터파이어', base.treasure)
  .doneStrict();

export const jewelMetaMap = createSubWeaponMetaBuilder<JewelName>(
  {
    part: 'jewel',
    // requiredClass에 시그너스 기사단 추가
    requiredClass: ['소울마스터', '플레임위자드', '윈드브레이커', '나이트워커', '스트라이커'],
    requiredLevel: 100,
  },
  { isOppositeAttack: true },
)
  .add('에레브의 광휘', { all: 10, attackPower: 3 })
  .add('이볼빙 에레브의 광휘', { all: 10, attackPower: 5 })
  .add('블랙 에레브의 광휘', { all: 8, attackPower: 5 })
  .add('메이플 트레져 에레브의 광휘', { requiredLevel: 110, all: 9, attackPower: 9 })
  .doneStrict();

export const soulShieldMetaMap = createSubWeaponMetaBuilder<SoulShieldName>({
  part: 'soulShield',
  requiredClass: '미하일',
  requiredLevel: 100,
})
  .add('정의의 소울실드', { stat: 21, maxHp: 800, maxMp: 110, armor: 105 })
  .add('이볼빙 정의의 소울실드', { stat: 21, maxHp: 800, maxMp: 110, attackPower: 2, armor: 105 })
  .add('블랙 소울실드', { stat: 10, maxHp: 500, maxMp: 100, armor: 81 })
  .add('메이플 트레져 소울실드', { requiredLevel: 110, stat: 11, maxHp: 560, maxMp: 100 })
  .doneStrict();

export const chargeMetaMap = createSubWeaponMetaBuilder<ChargeName>({
  part: 'charge',
  requiredClass: '블래스터',
  requiredLevel: 100,
})
  .add('익스플로시브 필<3호>', base.normal)
  .add('이볼빙 익스플로시브 필<3호>', base.evolving)
  .add('블랙 익스플로시브 필', base.black)
  .doneStrict();

export const magicMarbleMetaMap = createSubWeaponMetaBuilder<MagicMarbleName>({
  part: 'magicMarble',
  requiredClass: '배틀메이지',
  requiredLevel: 100,
})
  .add('맥시마이즈 볼', base.normal)
  .add('이볼빙 맥시마이즈 볼', base.evolving)
  .add('블랙 맥시마이즈 볼', base.black)
  .add('메이플 트레져 메모라이즈볼', base.treasure)
  .doneStrict();

export const arrowheadMetaMap = createSubWeaponMetaBuilder<ArrowheadName>({
  part: 'arrowhead',
  requiredClass: '와일드헌터',
  requiredLevel: 100,
})
  .add('와일드 팡', base.normal)
  .add('이볼빙 와일드 팡', base.evolving)
  .add('블랙 와일드 팡', base.black)
  .add('메이플 트레져 와일드비크', base.treasure)
  .doneStrict();

export const magnumMetaMap = createSubWeaponMetaBuilder<MagnumName>({
  part: 'magnum',
  requiredClass: '메카닉',
  requiredLevel: 100,
})
  .add('이터널 매그넘', { dex: 10 })
  .add('이볼빙 이터널 매그넘', { dex: 10, attackPower: 1 })
  .add('블랙 매그넘', { stat: 8 })
  .add('메이플 트레져 매그넘', { requiredLevel: 110, stat: 9 })
  .doneStrict();

export const forceShieldMetaMap = createSubWeaponMetaBuilder<ForceShieldName>({
  part: 'forceShield',
  requiredClass: ['데몬슬레이어', '데몬어벤져'],
  requiredLevel: 100,
})
  .add('극한의 포스실드', { str: 21, dex: 21, maxHp: 800, armor: 105, maxDf: 110 })
  .add('이볼빙 극한의 포스실드', { str: 21, dex: 21, maxHp: 800, armor: 105, maxDf: 110, attackPower: 2 })
  .add('블랙 포스실드', { str: 10, dex: 10, maxHp: 560, maxDf: 100, armor: 81 })
  .add('루인 포스실드', { str: 10, dex: 10, maxHp: 560, maxDf: 100, armor: 81, finalDamage: 10 })
  .add('메이플 트레져 포스실드', { requiredLevel: 110, str: 11, dex: 11, maxHp: 560, maxDf: 100 })
  .doneStrict();

export const controllerMetaMap = createSubWeaponMetaBuilder<ControllerName>({
  part: 'controller',
  requiredClass: '제논',
  requiredLevel: 100,
})
  .add('옥타코어 컨트롤러', { all: 2, maxHp: 900, maxMp: 500, armor: 380 })
  .add('이볼빙 옥타코어 컨트롤러', { all: 2, maxHp: 900, maxMp: 500, armor: 380, attackPower: 2 })
  .add('블랙 옥타코어 컨트롤러', { all: 2, maxHp: 800, maxDf: 450, armor: 380 })
  .add('메이플 트레져 컨트롤러', { requiredLevel: 110, all: 3, maxMp: 450, armor: 390 })
  .doneStrict();

export const ballastMetaMap = createSubWeaponMetaBuilder<BallastName>({
  part: 'ballast',
  requiredClass: '아란',
  requiredLevel: 100,
})
  .add('천룡추', base.normal)
  .add('이볼빙 천룡추', base.evolving)
  .add('블랙 천룡추', base.black)
  .add('메이플 트레져 천룡추', base.treasure)
  .doneStrict();

export const documentMetaMap = createSubWeaponMetaBuilder<DocumentName>({
  part: 'document',
  requiredClass: '에반',
  requiredLevel: 100,
})
  .add('드래곤마스터의 유산', base.normal)
  .add('이볼빙 드래곤마스터의 유산', base.evolving)
  .add('블랙 드래곤마스터의 유산', base.black)
  .add('메이플 트레져의 유산', base.treasure)
  .doneStrict();

export const orbMetaMap = createSubWeaponMetaBuilder<OrbName>({
  part: 'orb',
  requiredClass: '루미너스',
  requiredLevel: 100,
})
  .add('카르마 오브')
  .add('이볼빙 카르마 오브', { attackPower: 2 })
  .add('블랙 오브', { stat: 8 })
  .add('메이플 트레져 오브', { requiredLevel: 110, stat: 9 })
  .doneStrict();

export const magicArrowMetaMap = createSubWeaponMetaBuilder<MagicArrowName>({
  part: 'magicArrow',
  requiredClass: '메르세데스',
  requiredLevel: 100,
})
  .add('무한의 마법 화살')
  .add('이볼빙 무한의 마법 화살', { attackPower: 2 })
  .add('블랙 마법 화살', { stat: 8 })
  .add('메이플 트레져 마법화살', { requiredLevel: 110, stat: 9 })
  .doneStrict();

export const cardMetaMap = createSubWeaponMetaBuilder<CardName>({
  part: 'card',
  requiredClass: '팬텀',
  requiredLevel: 100,
})
  .add('데르니에 카르트')
  .add('이볼빙 데르니에 카르트', { attackPower: 2 })
  .add('블랙 카르트', { stat: 8 })
  .add('메이플 트레져 카르트', { requiredLevel: 110, stat: 9 })
  .doneStrict();

export const foxMarbleMetaMap = createSubWeaponMetaBuilder<FoxMarbleName>({
  part: 'foxMarble',
  requiredClass: '은월',
  requiredLevel: 100,
})
  .add('황금빛 여우구슬', base.normal)
  .add('이볼빙 황금빛 여우구슬', base.evolving)
  .add('블랙 여우구슬', base.black)
  .add('메이플 트레져 여우구슬', base.treasure)
  .doneStrict();

export const novaEssenceMetaMap = createSubWeaponMetaBuilder<NovaEssenceName>({
  part: 'novaEssence',
  requiredClass: '카이저',
  requiredLevel: 100,
})
  .add('진리의 노바의 정수', { all: 10 })
  .add('이볼빙 진리의 노바의 정수', { all: 10, attackPower: 2 })
  .add('블랙 노바의 정수', { all: 8 })
  .add('메이플 트레져의 정수', { requiredLevel: 110, all: 9 })
  .doneStrict();

export const weaponBeltMetaMap = createSubWeaponMetaBuilder<WeaponBeltName>({
  part: 'weaponBelt',
  requiredClass: '카인',
  requiredLevel: 100,
})
  .add('D100 커스텀 웨폰 벨트', base.normal)
  .add('이볼빙 D100 웨폰 벨트', base.evolving)
  .add('블랙 D100 웨폰 벨트', base.black)
  .doneStrict();

export const weaponTransmitterMetaMap = createSubWeaponMetaBuilder<WeaponTransmitterName>({
  part: 'weaponTransmitter',
  requiredClass: '카데나',
  requiredLevel: 100,
})
  .add('트랜스미터 type:A', base.normal)
  .add('이볼빙 트랜스미터 type:A', base.evolving)
  .add('블랙 트랜스미터', base.black)
  .doneStrict();

export const soulRingMetaMap = createSubWeaponMetaBuilder<SoulRingName>({
  part: 'soulRing',
  requiredClass: '엔젤릭버스터',
  requiredLevel: 100,
})
  .add('그린 소울링', { all: 10, maxHp: 900, armor: 300 })
  .add('이볼빙 그린 소울링', { all: 10, maxHp: 900, attackPower: 2, armor: 300 })
  .add('블랙 소울링', { all: 8, maxHp: 800, armor: 275 })
  .add('메이플 트레져 소울링', { requiredLevel: 110, all: 9, armor: 280 })
  .doneStrict();

export const braceletMetaMap = createSubWeaponMetaBuilder<BraceletName>({
  part: 'bracelet',
  requiredClass: '아델',
  requiredLevel: 100,
})
  .add('노블 브레이슬릿', base.normal)
  .add('이볼빙 노블 브레이슬릿', base.evolving)
  .add('블랙 샤이니 브레이슬릿', base.black)
  .doneStrict();

export const magicWingMetaMap = createSubWeaponMetaBuilder<MagicWingName>({
  part: 'magicWing',
  requiredClass: '일리움',
  requiredLevel: 100,
})
  .add('글로리 매직윙', base.normal)
  .add('이볼빙 글로리 매직윙', base.evolving)
  .add('블랙 매직윙', base.black)
  .doneStrict();

export const passMetaMap = createSubWeaponMetaBuilder<PassName>({
  part: 'pass',
  requiredClass: '아크',
  requiredLevel: 100,
})
  .add('얼티밋 패스', base.normal)
  .add('이볼빙 얼티밋 패스', base.evolving)
  .add('블랙 패스', base.black)
  .doneStrict();

export const yeouijuMetaMap = createSubWeaponMetaBuilder<YeouijuName>({
  part: 'yeouiju',
  requiredClass: '렌',
  requiredLevel: 100,
})
  .add('자색 여의보주', base.normal)
  .add('이볼빙 자색 여의보주', base.evolving)
  .add('블랙 여의보주', base.black)
  .doneStrict();

export const norigaeMetaMap = createSubWeaponMetaBuilder<NorigaeName>({
  part: 'norigae',
  requiredClass: '라라',
  requiredLevel: 100,
})
  .add('빛나는 사옥 노리개', base.normal)
  .add('이볼빙 사옥 노리개', base.evolving)
  .add('블랙 사옥 노리개', base.black)
  .doneStrict();

export const seonchuMetaMap = createSubWeaponMetaBuilder<SeonchuName>({
  part: 'seonchu',
  requiredClass: '호영',
  requiredLevel: 100,
})
  .add('월장석 선추', base.normal)
  .add('이볼빙 월장석 선추', base.evolving)
  .add('블랙 황수정 선추', base.black)
  .doneStrict();

export const chessPieceMetaMap = createSubWeaponMetaBuilder<ChessPieceName>({
  part: 'chessPiece',
  requiredClass: '키네시스',
  requiredLevel: 100,
})
  .add('체스피스 디 퀸', base.normal)
  .add('이볼빙 체스피스 디 퀸', base.evolving)
  .add('체스피스 블랙 퀸', base.black)
  .doneStrict();

export const commonShieldMetaMap = createSubWeaponMetaBuilder<CommonShieldName>({
  part: 'shield',
  requiredClass: '공용',
  capability: {
    scrollUpgradeEnabled: true,
    starforceEnabled: true,
  },
})
  .add('사각 나무 방패', { requiredLevel: 5, armor: 5, scrollCount: 7 })
  .add('냄비 뚜껑', { requiredLevel: 10, armor: 10, scrollCount: 7 })
  .add('메이플 실드', { requiredLevel: 20, armor: 10, scrollCount: 10 })
  .add('뉴멤버 실드', { armor: 25, scrollCount: 7 })
  .add('코-크플레이 방패', { requiredLevel: 30, armor: 12, scrollCount: 7 })
  .doneStrict();

export const warriorShieldMetaMap = createSubWeaponMetaBuilder<WarriorShieldName>(
  {
    part: 'shield',
    requiredClass: '전사',
    capability: {
      scrollUpgradeEnabled: true,
      starforceEnabled: true,
    },
  },
  { scrollCount: 7 },
)
  .add('우드 버클러', { requiredLevel: 10, armor: 10 })
  .add('강철 방패', { requiredLevel: 15, armor: 15 })
  .add('미스릴 버클러', { requiredLevel: 20, armor: 20 })
  .add('빨간 삼각 방패', { requiredLevel: 25, armor: 25 })
  .add('크로스 실드', { requiredLevel: 30, armor: 30 })
  .add('배틀 실드', { requiredLevel: 35, armor: 35 })
  .add('스틸 타워 실드', { requiredLevel: 40, armor: 40 })
  .add('미스릴 타워 실드', { requiredLevel: 40, str: 2, armor: 40 })
  .add('아다만티움 타워 실드', { requiredLevel: 40, dex: 2, armor: 40 })
  .add('해골 방패', { requiredLevel: 50, armor: 50 })
  .add('우드 레전드 실드', { requiredLevel: 60, armor: 52 })
  .add('실버 레전드 실드', { requiredLevel: 60, dex: 2, armor: 52 })
  .add('아다만티움 레전드 실드', { requiredLevel: 60, str: 2, armor: 52 })
  .add('메이플 워리어 실드', { requiredLevel: 64, str: 2, armor: 53, scrollCount: 10 })
  .add('스틸 에이션트 실드', { requiredLevel: 70, armor: 56 })
  .add('실버 에이션트 실드', { requiredLevel: 70, dex: 2, armor: 56 })
  .add('골드 에이션트 실드', { requiredLevel: 70, str: 2, armor: 56 })
  .add('스틸 아퀴라 실드', { requiredLevel: 80, armor: 60 })
  .add('실버 아퀴라 실드', { requiredLevel: 80, armor: 62 })
  .add('골드 아퀴라 실드', { requiredLevel: 80, armor: 64 })
  .add('브론즈 칼칸', { requiredLevel: 9, dex: 2, armor: 66 })
  .add('실버 칼칸', { requiredLevel: 90, str: 3, armor: 68 })
  .add('골드 칼칸', { requiredLevel: 90, str: 3, armor: 70 })
  .add('그린 호플론', { requiredLevel: 100, dex: 3, armor: 72 })
  .add('바이올렛 호플론', { requiredLevel: 100, str: 3, armor: 74 })
  .add('블루 호플론', { requiredLevel: 100, str: 4, armor: 76 })
  .add('블루 드래곤 실드', { requiredLevel: 110, str: 7, dex: 4, armor: 78 })
  .add('타임리스 카이트 실드', { requiredLevel: 120, str: 7, dex: 5, armor: 100 })
  .add('겔러해드 실드', { requiredLevel: 120, str: 7, dex: 3, armor: 84 })
  .add('피어리스 카이트 실드', { requiredLevel: 125, str: 10, dex: 5, armor: 180, scrollCount: 8 })
  .add('데이모스 워리어 실드', { requiredLevel: 130, str: 10, dex: 10, armor: 118 })
  .doneStrict();

export const mageShieldMetaMap = createSubWeaponMetaBuilder<MageShieldName>(
  {
    part: 'shield',
    requiredClass: '마법사',
    capability: {
      scrollUpgradeEnabled: true,
      starforceEnabled: true,
    },
  },
  { scrollCount: 7 },
)
  .add('미스틱 실드', { requiredLevel: 22, int: 1, armor: 10 })
  .add('에스터 실드', { requiredLevel: 33, int: 1, armor: 20 })
  .add('메이플 매지션 실드', { requiredLevel: 64, int: 2, armor: 51, scrollCount: 10 })
  .add('타임리스 프렐류드', { requiredLevel: 120, int: 5, armor: 110 })
  .add('피어리스 프렐류드', { requiredLevel: 125, int: 10, luk: 5, armor: 180, scrollCount: 8 })
  .add('데이모스 세이지 실드', { requiredLevel: 130, int: 10, armor: 130 })
  .doneStrict();

export const thiefShieldMetaMap = createSubWeaponMetaBuilder<ThiefShieldName>(
  {
    part: 'shield',
    requiredClass: '도적',
    capability: {
      scrollUpgradeEnabled: true,
      starforceEnabled: true,
    },
  },
  { scrollCount: 7 },
)
  .add('님블 리스트', { requiredLevel: 22, str: 1, armor: 19 })
  .add('주르건 리스트', { requiredLevel: 22, dex: 1, armor: 19 })
  .add('시클루전 리스트', { requiredLevel: 22, luk: 1, armor: 19 })
  .add('메이플 시브즈 실드', { requiredLevel: 64, luk: 2, armor: 40, scrollCount: 10 })
  .add('타임리스 리스트', { requiredLevel: 120, luk: 5, armor: 84 })
  .add('피어리스 리스트', { requiredLevel: 125, dex: 5, luk: 10, armor: 150, scrollCount: 8 })
  .add('데이모스 다크니스 실드', { requiredLevel: 130, luk: 10, armor: 99 })
  .doneStrict();

export const astraShieldMetaMap = createSubWeaponMetaBuilder<AstraShieldName>(
  {
    part: 'shield',
    requiredClass: '공용',
    requiredLevel: 200,
    capability: {
      scrollUpgradeEnabled: true,
      starforceEnabled: true,
    },
  },
  { scrollCount: 5, stat: 20, attackPower: 7 },
)
  .add('아스트라 세이크리드 이지스', { requiredClass: ['히어로', '팔라딘'] })
  .add('아스트라 토파즈 이지스', { requiredClass: '소울마스터' })
  .add('아스트라 아케인 실드', { requiredClass: ['아크메이지(불,독)', '아크메이지(썬,콜)', '비숍'] })
  .add('아스트라 루비 실드', { requiredClass: '플레임위자드' })
  .add('아스트라 프로미넌트 실드', { requiredClass: '에반' })
  .add('아스트라 엄브럴 실드', { requiredClass: '배틀메이지' })
  .add('아스트라 베인 실드', { requiredClass: '섀도어' })
  .doneStrict();

export const astraMetaMap = createSubWeaponMetaBuilder<AstraName>(
  {
    requiredClass: '공용',
    capability: {
      starforceEnabled: true,
    },
  },
  { stat: 20, attackPower: 7 },
)
  .add('아스트라 메달', { requiredClass: '히어로', part: 'medal' })
  .add('아스트라 로자리오', { requiredClass: '팔라딘', part: 'rosario' })
  .add('아스트라 체인', { requiredClass: '다크나이트', part: 'chainIron' })
  .add('아스트라 페더', { requiredClass: '보우마스터', part: 'arrowFeather' })
  .add('아스트라 불스아이', { requiredClass: '신궁', part: 'thumbRing' })
  .add('아스트라 렐릭', { requiredClass: '패스파인더', part: 'relic' })
  .add('아스트라 탈리스만', { requiredClass: '나이트로드', part: 'charm' })
  .add('아스트라 블레이드', {
    requiredClass: '듀얼블레이더',
    part: 'blade',
    capability: { scrollUpgradeEnabled: true },
    attackPower: 225,
    str: 30,
    dex: 30,
    luk: 100,
    scrollCount: 10,
  })
  .add('아스트라 리스트 밴드', { requiredClass: '바이퍼', part: 'wristBand' })
  .add('아스트라 레이븐아이', { requiredClass: '캡틴', part: 'sight' })
  .add('아스트라 림리스', { requiredClass: '캐논마스터', part: 'powderKeg' })
  .add('아스트라 토파즈', { requiredClass: '소울마스터', part: 'jewel' })
  .add('아스트라 에메랄드', { requiredClass: '윈드브레이커', part: 'jewel' })
  .add('아스트라 옵시디언', { requiredClass: '나이트워커', part: 'jewel' })
  .add('아스트라 사파이어', { requiredClass: '스트라이커', part: 'jewel' })
  .add('아스트라 소울실드', { requiredClass: '미하일', part: 'soulShield' })
  .add('아스트라 익스플로시브 필', { requiredClass: '블래스터', part: 'charge' })
  .add('아스트라 와일드 터스크', { requiredClass: '와일드헌터', part: 'arrowhead' })
  .add('아스트라 매그넘', { requiredClass: '메카닉', part: 'magnum' })
  .add('아스트라 포스실드', {
    requiredClass: ['데몬슬레이어', '데몬어벤져'],
    part: 'forceShield',
    // 루인 포스실드 전승시에만
    grantedSkills: ['아스트라 인퓨전'],
    str: 20,
    dex: 20,
    maxHp: 1000,
    maxDf: 110,
  })
  .add('아스트라 데카코어 컨트롤러', { requiredClass: '제논', part: 'controller', stat: 0, all: 10, maxHp: 1000, maxMp: 1000 })
  .add('아스트라 백호추', { requiredClass: '아란', part: 'ballast' })
  .add('아스트라 오브', { requiredClass: '루미너스', part: 'orb' })
  .add('아스트라 마법 화살', { requiredClass: '메르세데스', part: 'magicArrow' })
  .add('아스트라 카르트', { requiredClass: '팬텀', part: 'card' })
  .add('아스트라 여우구슬', { requiredClass: '은월', part: 'foxMarble' })
  .add('아스트라 노바의 정수', { requiredClass: '카이저', part: 'novaEssence' })
  .add('아스트라 웨폰 벨트', { requiredClass: '카인', part: 'weaponBelt' })
  .add('아스트라 트랜스미터', { requiredClass: '카데나', part: 'weaponTransmitter' })
  .add('아스트라 소울링', { requiredClass: '엔젤릭버스터', part: 'soulRing' })
  .add('아스트라 브레이슬릿', { requiredClass: '아델', part: 'bracelet' })
  .add('아스트라 매직윙', { requiredClass: '일리움', part: 'magicWing' })
  .add('아스트라 패스', { requiredClass: '아크', part: 'pass' })
  .add('아스트라 여의보주', { requiredClass: '렌', part: 'yeouiju' })
  .add('아스트라 금강석 선추', { requiredClass: '호영', part: 'seonchu' })
  .add('아스트라 아워글라스', { requiredClass: '제로', part: 'hourglass', bossDamage: 45, ignoreMonsterArmor: 20 })
  .add('아스트라 체스피스 디 킹', { requiredClass: '키네시스', part: 'chessPiece' })
  .doneStrict();

export const subWeaponItemMetaMap = {
  ...medalMetaMap,
  ...rosarioMetaMap,
  ...chainIronMetaMap,
  ...redGreenGrimoireMetaMap,
  ...blueSilverGrimoireMetaMap,
  ...platinumGrimoireMetaMap,
  ...arrowFeatherMetaMap,
  ...thumbRingMetaMap,
  ...relicMetaMap,
  ...charmMetaMap,
  ...daggerScabbardMetaMap,
  ...wristBandMetaMap,
  ...sightMetaMap,
  ...powderKegMetaMap,
  ...jewelMetaMap,
  ...soulShieldMetaMap,
  ...chargeMetaMap,
  ...magicMarbleMetaMap,
  ...arrowheadMetaMap,
  ...magnumMetaMap,
  ...forceShieldMetaMap,
  ...controllerMetaMap,
  ...ballastMetaMap,
  ...documentMetaMap,
  ...orbMetaMap,
  ...magicArrowMetaMap,
  ...cardMetaMap,
  ...foxMarbleMetaMap,
  ...novaEssenceMetaMap,
  ...weaponBeltMetaMap,
  ...weaponTransmitterMetaMap,
  ...soulRingMetaMap,
  ...braceletMetaMap,
  ...magicWingMetaMap,
  ...passMetaMap,
  ...yeouijuMetaMap,
  ...norigaeMetaMap,
  ...seonchuMetaMap,
  ...chessPieceMetaMap,
  ...commonShieldMetaMap,
  ...warriorShieldMetaMap,
  ...mageShieldMetaMap,
  ...thiefShieldMetaMap,
  ...astraShieldMetaMap,
  ...astraMetaMap,
} as const;
