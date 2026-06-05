import type { RawSkillInjectionRule } from '@@types';

export const rawCommonZeroSkillNames = ['정령의 축복', '여제의 축복', '연합의 의지', '영웅의 메아리', '익스클루시브 스펠', '인탠시브 타임'] as const;

/**
 * 스킬 주입 규칙 모음
 *
 * @constant rawCommonZeroSkillNames
 * 전직업 공통으로 살리는 0차 skillName 목록. 실제 skillID는 각 0차 jobID마다 다를 수 있다.
 * @constant rawZeroSkillInjectionRules
 * 직업별 0차 jobID whitelist 규칙.
 * @constant rawConditionalZeroSkillInjectionRules
 * 해방/전문기술/길드 등 조건부 0차 성격 스킬 주입 규칙.
 */

/**
 * 직업별 0차 jobID에서 실제 계산/메타데이터에 필요한 스킬만 살리는 whitelist 규칙.
 *
 * 원본 0차 jobID에는 튜토리얼, 외형 변경, 이벤트, 시스템 스킬이 많이 섞여 있으므로
 * resolver는 0차 jobID 전체를 사용하지 않고 이 목록에 명시된 skillID만 통과시킨다.
 *
 * 직업 정체성 패시브, 소속군 공통 0차 스킬, 동일명/동일 jobID 내 변형 skillID를 ID 단위로 명시한다.
 */
export const rawZeroSkillInjectionRules = [
  {
    key: 'anima-spirit-affinity',
    kind: 'lineageZero',
    appliesTo: {
      lineages: ['anima'],
    },
    skills: [
      { jobID: '16000', skillID: '160000000', skillName: '정령친화', note: '호영 0차' },
      { jobID: '16001', skillID: '160010000', skillName: '정령친화', note: '라라 0차' },
      { jobID: '16002', skillID: '160020000', skillName: '정령친화', note: '렌 0차' },
    ],
  },
  {
    key: 'cygnus-elemental',
    kind: 'lineageZero',
    appliesTo: {
      classes: ['소울마스터', '플레임위자드', '윈드브레이커', '나이트워커', '스트라이커'],
    },
    skills: [
      { jobID: '1000', skillID: '10000246', skillName: '엘리멘탈 하모니', note: 'STR 계열' },
      { jobID: '1000', skillID: '10000247', skillName: '엘리멘탈 하모니', note: 'DEX 계열' },
      { jobID: '1000', skillID: '10000248', skillName: '엘리멘탈 하모니', note: 'INT 계열' },
      { jobID: '1000', skillID: '10000249', skillName: '엘리멘탈 하모니', note: 'LUK 계열' },
      { jobID: '1000', skillID: '10000250', skillName: '엘리멘탈 엑스퍼트' },
    ],
  },
  {
    key: 'mihile-elemental',
    kind: 'classZero',
    appliesTo: {
      classes: ['미하일'],
    },
    skills: [{ jobID: '5000', skillID: '50000250', skillName: '엘리멘탈 엑스퍼트' }],
  },
  {
    key: 'aran-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['아란'],
    },
    skills: [{ jobID: '2000', skillID: '20000194', skillName: '되찾은 기억' }],
  },
  {
    key: 'evan-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['에반'],
    },
    skills: [{ jobID: '2001', skillID: '20010194', skillName: '계승된 의지' }],
  },
  {
    key: 'mercedes-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['메르세데스'],
    },
    skills: [{ jobID: '2002', skillID: '20020112', skillName: '왕의 자격' }],
  },
  {
    key: 'phantom-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['팬텀'],
    },
    skills: [
      { jobID: '2003', skillID: '20030206', skillName: '하이 덱스터러티' },
      { jobID: '2003', skillID: '20031209', skillName: '저지먼트' },
      { jobID: '2003', skillID: '20031210', skillName: '저지먼트' },
    ],
  },
  {
    key: 'luminous-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['루미너스'],
    },
    skills: [
      { jobID: '2004', skillID: '20040216', skillName: '선파이어' },
      { jobID: '2004', skillID: '20040217', skillName: '이클립스' },
      { jobID: '2004', skillID: '20040219', skillName: '이퀄리브리엄' },
      { jobID: '2004', skillID: '20040220', skillName: '이퀄리브리엄' },
      { jobID: '2004', skillID: '20040221', skillName: '파워 오브 라이트' },
    ],
  },
  {
    key: 'eunwol-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['은월'],
    },
    skills: [{ jobID: '2005', skillID: '20050074', skillName: '정령친화', note: '아니마 정령친화와 수치가 다름' }],
  },
  {
    key: 'demon-avenger-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['데몬어벤져'],
    },
    skills: [
      { jobID: '3001', skillID: '30010230', skillName: '익시드' },
      { jobID: '3001', skillID: '30010232', skillName: '컨버전 스타포스', note: '데몬어벤져 전용 효과' },
      { jobID: '3001', skillID: '30010242', skillName: '블러드 컨트랙트' },
    ],
  },
  {
    key: 'xenon-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['제논'],
    },
    skills: [
      { jobID: '3002', skillID: '30020232', skillName: '서플러스 서플라이' },
      { jobID: '3002', skillID: '30020234', skillName: '멀티래터럴 I' },
      { jobID: '3002', skillID: '30020300', skillName: '컨버전 스타포스', note: '제논 전용 효과' },
    ],
  },
  {
    key: 'kaiser-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['카이저'],
    },
    skills: [{ jobID: '6000', skillID: '60000222', skillName: '아이언 윌', note: '카이저 전용 효과' }],
  },
  {
    key: 'angelic-buster-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['엔젤릭버스터'],
    },
    skills: [{ jobID: '6001', skillID: '60010217', skillName: '트루 석세서' }],
  },
  {
    key: 'zero-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['제로'],
    },
    skills: [
      { jobID: '10000', skillID: '100000263', skillName: '디바인 오라' },
      { jobID: '10000', skillID: '100000279', skillName: '리졸브 타임' },
    ],
  },
  {
    key: 'kinesis-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['키네시스'],
    },
    skills: [{ jobID: '14000', skillID: '140000291', skillName: '초감각' }],
  },
  {
    key: 'lef-magic-circuit',
    kind: 'lineageZero',
    appliesTo: {
      lineages: ['lef'],
    },
    skills: [
      { jobID: '15000', skillID: '150000079', skillName: '매직 서킷', note: '일리움: 공격력 -> 마력 치환' },
      { jobID: '15001', skillID: '150010079', skillName: '매직 서킷', note: '아크: 마력 -> 공격력 치환, 수치 다름' },
      { jobID: '15002', skillID: '150020079', skillName: '매직 서킷', note: '아델: 마력 -> 공격력 치환, 수치 다름' },
      { jobID: '15003', skillID: '150030079', skillName: '매직 서킷', note: '칼리: 마력 -> 공격력 치환' },
    ],
  },
  {
    key: 'adele-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['아델'],
    },
    skills: [{ jobID: '15002', skillID: '150020006', skillName: '패이스' }],
  },
  {
    key: 'ark-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['아크'],
    },
    skills: [{ jobID: '15001', skillID: '150011074', skillName: '컨택트 카라반' }],
  },
  {
    key: 'hoyoung-identity',
    kind: 'classZero',
    appliesTo: {
      classes: ['호영'],
    },
    skills: [{ jobID: '16000', skillID: '160000076', skillName: '괴이봉인' }],
  },
] as const satisfies readonly RawSkillInjectionRule[];

/**
 * 직업 기본 스킬이 아니라 조건을 만족할 때 전직업 또는 일부 직업에 추가되는 0차 성격의 스킬팩.
 *
 * 제네시스/데스티니/아스트라 해방, 전문기술, 길드 스킬처럼 캐릭터 직업 체인이 아니라
 * 장비 상태, 해방 진행도, 길드/전문기술 사용 여부 같은 resolve 옵션으로 주입한다.
 */
export const rawConditionalZeroSkillInjectionRules = [
  {
    key: 'genesis-liberated',
    kind: 'conditionalZero',
    appliesTo: {
      condition: 'genesisWeaponLiberated',
    },
    skills: [
      { jobID: '800026', skillID: '80002632', skillName: '파괴의 얄다바오트' },
      { jobID: '800026', skillID: '80002644', skillName: '파괴의 얄다바오트' },
    ],
  },
  {
    key: 'destiny-first-liberated',
    kind: 'conditionalZero',
    appliesTo: {
      condition: 'destinyWeaponFirstLiberated',
    },
    skills: [{ jobID: '800038', skillID: '80003873', skillName: '초월 : 결전의 의지' }],
  },
  {
    key: 'destiny-second-liberated',
    kind: 'conditionalZero',
    appliesTo: {
      condition: 'destinyWeaponSecondLiberated',
    },
    skills: [
      { jobID: '800041', skillID: '80004115', skillName: '초월 : 결전의 의지' },
      { jobID: '800041', skillID: '80004118', skillName: '초월 : 최초의 유산' },
    ],
  },
  {
    key: 'astra-ruin-force-shield-liberated',
    kind: 'conditionalZero',
    appliesTo: {
      classes: ['데몬슬레이어', '데몬어벤져'],
      condition: 'astraRuinForceShieldLiberated',
    },
    skills: [{ jobID: '800040', skillID: '80004098', skillName: '아스트라 인퓨전' }],
  },
  {
    key: 'advanced-weapon-refinement',
    kind: 'conditionalZero',
    appliesTo: {
      condition: 'advancedWeaponRefinement',
    },
    skills: [{ jobID: '800023', skillID: '80002363', skillName: '고급 무기 제련' }],
  },
  {
    key: 'guild-bossing-buffs',
    kind: 'conditionalZero',
    appliesTo: {
      condition: 'guildSkill',
    },
    skills: [
      { jobID: '9100', skillID: '91001022', skillName: '보스 킬링 머신' },
      { jobID: '9100', skillID: '91001023', skillName: '방어력은 숫자일 뿐' },
      { jobID: '9100', skillID: '91001024', skillName: '길드의 이름으로' },
      { jobID: '9100', skillID: '91001025', skillName: '크게 한방' },
    ],
  },
] as const satisfies readonly RawSkillInjectionRule[];
