import { describe, expect, it } from 'vitest';

import { calcSkillDelay } from './skill-delay';

describe('calcSkillDelay', () => {
  it('applies the default attack speed and rounds to 30ms', () => {
    expect(calcSkillDelay(1380)).toBe(1050);
  });

  it('applies the supplied attack speed', () => {
    expect(calcSkillDelay(600, 0)).toBe(390);
  });
});
