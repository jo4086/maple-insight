import { DisplaySlot, EquipmentCategory, EquipmentSlot } from '.';

type EquipmentSlotMeta = {
  displayName: DisplaySlot;
  category: EquipmentCategory;
  visible: boolean;
};

export const equipmentSlotMetaMap: Record<EquipmentSlot, EquipmentSlotMeta> = {
  모자: { displayName: '모자', category: '방어구', visible: true },
  상의: { displayName: '상의', category: '방어구', visible: true },
  하의: { displayName: '하의', category: '방어구', visible: true },
  한벌옷: { displayName: '한벌옷', category: '방어구', visible: true },
  신발: { displayName: '신발', category: '방어구', visible: true },
  장갑: { displayName: '장갑', category: '방어구', visible: true },
  망토: { displayName: '망토', category: '방어구', visible: true },

  얼굴장식: { displayName: '얼굴장식', category: '장신구', visible: true },
  눈장식: { displayName: '눈장식', category: '장신구', visible: true },
  귀고리: { displayName: '귀고리', category: '장신구', visible: true },
  반지1: { displayName: '반지', category: '장신구', visible: true },
  반지2: { displayName: '반지', category: '장신구', visible: true },
  반지3: { displayName: '반지', category: '장신구', visible: true },
  반지4: { displayName: '반지', category: '장신구', visible: true },
  펜던트: { displayName: '펜던트', category: '장신구', visible: true },
  펜던트2: { displayName: '펜던트', category: '장신구', visible: true },
  벨트: { displayName: '벨트', category: '장신구', visible: true },

  훈장: { displayName: '훈장', category: '장신구', visible: false },
  어깨장식: { displayName: '어깨장식', category: '장신구', visible: false },
  '포켓 아이템': { displayName: '포켓 아이템', category: '장신구', visible: false },
  뱃지: { displayName: '뱃지', category: '장신구', visible: false },
  엠블렘: { displayName: '엠블렘', category: '장신구', visible: false },
  파워소스: { displayName: '파워소스', category: '장신구', visible: false },

  '메카닉 엔진': { displayName: '메카닉 장비', category: '기타', visible: true },
  '메카닉 암': { displayName: '메카닉 장비', category: '기타', visible: true },
  '메카닉 레그': { displayName: '메카닉 장비', category: '기타', visible: true },
  '메카닉 프레임': { displayName: '메카닉 장비', category: '기타', visible: true },
  '메카닉 트랜지스터': { displayName: '메카닉 장비', category: '기타', visible: true },

  '드래곤 모자': { displayName: '드래곤 장비', category: '기타', visible: true },
  '드래곤 펜던트': { displayName: '드래곤 장비', category: '기타', visible: true },
  '드래곤 날개장식': { displayName: '드래곤 장비', category: '기타', visible: true },
  '드래곤 꼬리장식': { displayName: '드래곤 장비', category: '기타', visible: true },

  '기계 심장': { displayName: '기계 심장', category: '기타', visible: false },
  안드로이드: { displayName: '안드로이드', category: '기타', visible: false },

  무기: { displayName: '무기', category: '무기', visible: true },
  보조무기: { displayName: '보조무기', category: '보조무기', visible: true },
} as const;
