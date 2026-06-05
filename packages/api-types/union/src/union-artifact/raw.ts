export interface UnionArtifactEffectRaw {
  name: string;
  level: number;
}

export interface UnionArtifactCrystalRaw {
  name: string;
  validity_flag: string;
  date_expire: string | null;
  level: number;
  crystal_option_name_1: string;
  crystal_option_name_2: string;
  crystal_option_name_3: string;
}

export interface UnionArtifactResponseRaw {
  date: string | null;
  union_artifact_effect: UnionArtifactEffectRaw[];
  union_artifact_crystal: UnionArtifactCrystalRaw[];
  union_artifact_remain_ap: number;
}
