export const etcEquipmentTypes = ['메카닉장비', '안드로이드', '기계심장', '드래곤장비'] as const;

export const mechanicEquipmentTypes = ['레그', '암', '엔진', '트랜지스터', '프레임'] as const;

export const dragonEquipmentTypes = ['마스크', '윙즈', '테일', '펜던트'] as const;

export type EtcEquipmentType = (typeof etcEquipmentTypes)[number];
export type MechanicEquipmentType = (typeof mechanicEquipmentTypes)[number];
export type DragonEquipmentType = (typeof dragonEquipmentTypes)[number];
