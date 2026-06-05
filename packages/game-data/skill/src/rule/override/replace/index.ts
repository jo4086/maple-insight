/**
 * 기존 스킬 데이터를 특수 강화 스킬 데이터로 대체하는 규칙을 둔다.
 *
 * 예: 로 아이아스 강화처럼 원본 5차 스킬의 수식 자체가
 * 6차 특수 강화 전용 수식으로 바뀌는 경우.
 */
export type SixthSpecialEnhancementReplaceRule = {
  /** 원본 5차 스킬 ID */
  sourceSkillId: string;
  /** 원본 5차 스킬에 딸린 내부 스킬 ID */
  sourceInternalSkillIds?: readonly string[];
  /** 50006에 있는 특수 강화 스킬 ID */
  replacementSkillId: string;
  /** 50006에 있는 특수 강화 내부 스킬 ID */
  replacementInternalSkillIds?: readonly string[];
  /** 규칙을 해석하기 위한 간단한 설명 */
  desc?: string;
};

export const sixthSpecialEnhancementReplaceRules = {
  '홀리 유니티': {
    sourceSkillId: '400011003',
    sourceInternalSkillIds: ['400011021'],
    replacementSkillId: '500061000',
    replacementInternalSkillIds: ['500061001'],
  },
  '쉐도우 쉬프트': {
    sourceSkillId: '400041095',
    replacementSkillId: '500061004',
    replacementInternalSkillIds: ['500061005'],
  },
  '로 아이아스': {
    sourceSkillId: '400011011',
    sourceInternalSkillIds: ['400011141'],
    replacementSkillId: '500061008',
    replacementInternalSkillIds: ['500061009'],
    desc: '최종 데미지, 피해 감소율, 방어 횟수, 지속시간 수식이 50006 기준으로 대체된다.',
  },
  '라이트 오브 커리지': {
    sourceSkillId: '400011127',
    sourceInternalSkillIds: ['400011128'],
    replacementSkillId: '500061010',
    replacementInternalSkillIds: ['500061011'],
  },
  '소울 오브 크리스탈': {
    sourceSkillId: '400021068',
    replacementSkillId: '500061012',
  },
  '선기 : 극대 분신난무': {
    sourceSkillId: '400041048',
    sourceInternalSkillIds: ['400041049'],
    replacementSkillId: '500061014',
    replacementInternalSkillIds: ['500061015'],
  },
  '실루엣 미라주': {
    sourceSkillId: '400031053',
    sourceInternalSkillIds: ['400031054'],
    replacementSkillId: '500061016',
    replacementInternalSkillIds: ['500061017'],
  },
  '옵시디언 배리어': {
    sourceSkillId: '400031037',
    sourceInternalSkillIds: ['400031041'],
    replacementSkillId: '500061018',
    replacementInternalSkillIds: ['500061019', '500061020', '500061021', '500061022', '500061023', '500061024'],
  },
  '쉐도우 어썰트': {
    sourceSkillId: '400041002',
    sourceInternalSkillIds: ['400041003', '400041004', '400041005'],
    replacementSkillId: '500061025',
    replacementInternalSkillIds: ['500061026'],
  },
  '풀 메이커': {
    sourceSkillId: '400051074',
    sourceInternalSkillIds: ['400051075', '400051076', '400051077'],
    replacementSkillId: '500061029',
    replacementInternalSkillIds: ['500061030', '500061031', '500061032'],
  },
  '윈드 월': {
    sourceSkillId: '400031030',
    sourceInternalSkillIds: ['400031031'],
    replacementSkillId: '500061033',
    replacementInternalSkillIds: ['500061034'],
  },
  '쉐도우 바이트': {
    sourceSkillId: '400041037',
    replacementSkillId: '500061035',
  },
  신뇌합일: {
    sourceSkillId: '400051007',
    sourceInternalSkillIds: ['400051013', '400051093'],
    replacementSkillId: '500061036',
    replacementInternalSkillIds: ['500061037', '500061038'],
  },
  '엘리멘탈 블래스트': {
    sourceSkillId: '400021012',
    sourceInternalSkillIds: ['400021013', '400021014', '400021015', '400021016'],
    replacementSkillId: '500061041',
    replacementInternalSkillIds: ['500061042', '500061043', '500061044', '500061045'],
  },
  '엘리멘탈 고스트': {
    sourceSkillId: '400031007',
    sourceInternalSkillIds: ['400031008', '400031009', '400031011'],
    replacementSkillId: '500061046',
    replacementInternalSkillIds: ['500061047', '500061048', '500061049'],
  },
  레버넌트: {
    sourceSkillId: '400011112',
    sourceInternalSkillIds: ['400011129'],
    replacementSkillId: '500061054',
    replacementInternalSkillIds: ['500061055', '500061056', '500061057', '500061058'],
  },
  '오버로드 모드': {
    sourceSkillId: '400041029',
    sourceInternalSkillIds: ['400041031', '400041093'],
    replacementSkillId: '500061059',
    replacementInternalSkillIds: ['500061060', '500061079'],
  },
  '리미트 브레이크': {
    sourceSkillId: '400011015',
    sourceInternalSkillIds: ['400011024', '400011025'],
    replacementSkillId: '500061062',
    replacementInternalSkillIds: ['500061063', '500061064'],
  },
  '크리스탈 게이트': {
    sourceSkillId: '400021099',
    sourceInternalSkillIds: ['400021111'],
    replacementSkillId: '500061066',
    replacementInternalSkillIds: ['500061068'],
  },
  '쉐도우 서번트 익스텐드': {
    sourceSkillId: '400041028',
    sourceInternalSkillIds: ['400041081'],
    replacementSkillId: '500061080',
  },
} as const satisfies Record<string, SixthSpecialEnhancementReplaceRule>;
