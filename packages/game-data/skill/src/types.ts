export type SkillRawJobCategory =
  | {
      kind: 'fifthSkillCore';
      scope: 'all';
      desc: string;
    }
  | {
      kind: 'fifthSkillCore';
      scope: 'classGroup';
      classGroup: string;
      desc: string;
    }
  | {
      kind: 'sixthCore';
      scope: 'all';
      desc: string;
    }
  | {
      kind: 'sixthSpecialEnhancementCore';
      scope: 'all';
      desc: string;
    }
  | {
      kind: 'hexaStat';
      scope: 'all';
      desc: string;
    };

export type LinearDamagePercent = {
  base: number;
  perLevel: number;
};

export type SkillLinkedGroups = {
  skills: readonly string[];
  internalSkills?: readonly string[];
  linkedGroups?: readonly {
    source: string;
    linkedSkills: readonly string[];
  }[];
};
