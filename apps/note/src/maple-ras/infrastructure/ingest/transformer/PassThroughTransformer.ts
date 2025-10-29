// File: /src/infrastructure/ingest/transformer/PassThroughTransformer.ts
import { ITransformer } from '@/domain/ingest/services/IParser';

export class PassThroughTransformer implements ITransformer {
  async transform(rows: Record<string, unknown>[], _profile: unknown): Promise<Record<string, unknown>[]> {
    return rows;
  }
}

// File: /src/infrastructure/ingest/transformer/MyTransformer.ts
// import type { ITransformer } from '@/domain/ingest/services/IParser';
// import type { MyDTO } from '@/domain/ingest/types/MyDTO';
//
// export class MyTransformer implements ITransformer {
//   async transform(rows: Record<string, unknown>[], _profile: unknown): Promise<MyDTO[]> {
//     return rows.map((row) => ({
//       name: String(row['name']),
//       value: Number(row['value']),
//       level: Number(row['level'] ?? 0), // 예시로 기본값 0
//       isActive: Boolean(row['isActive'] ?? true), // 예시로 기본값 true
//     }));
//   }
// }
