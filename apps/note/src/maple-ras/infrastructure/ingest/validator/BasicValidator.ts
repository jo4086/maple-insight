// File: /src/infrastructure/ingest/validator/BasicValidator.ts
import type { IValidator } from '@/domain/ingest/services/IParser';

export class BasicValidator implements IValidator {
  async validate(items: unknown[]): Promise<{ ok: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const [i, item] of items.entries()) {
      if (!item || typeof item !== 'object') {
        errors.push(`Row ${i + 1}: 유효하지 않은 데이터`);
      }
    }

    return { ok: errors.length === 0, errors };
  }
}
