// File: /src/infrastructure/ingest/loader/MyLoader.ts
import type { ILoader } from '@/domain/ingest/services/IParser';

export class MyLoader implements ILoader {
  async load(items: unknown[]): Promise<{ successCount: number; failCount: number }> {
    // 여기서는 단순히 console.log로 대체
    console.log('데이터 적재:', items);
    return { successCount: items.length, failCount: 0 };
  }
}
