type PhaseSlot = {
  phase: number;
  motionCount: number;
  hitCount: number;
  /*
   * Basic skill damge
   * */
  basicDamage: number;

  /*
   * Skill damage per level
   * */
  levelDamage: number;
};

interface Skill {
  skillCode: string;
  skillName: string;
  skillPhase: [];
}

interface SkillPhaseSlot {
  skillCode: string;
}
type SkillPhass = SkillPhaseSlot[];
