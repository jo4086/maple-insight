export function calculateSkillActionDelay({ skillDelay }: { skillDelay: number }) {
  return Math.ceil((skillDelay * 0.75) / 30) * 30;
}
