// import { MyDTO } from '../types/MyDTO';

export interface IParser {
  parse(filePath: string): Promise<{ rows: Record<string, unknown>[] }>;

  parseStream?(filePath: string, onRow: (row: Record<string, unknown>) => Promise<void> | void): Promise<void>;
}

// export interface ITransformer {
//   transform(rows: Record<string, unknown>[], profile: unknown): Promise<unknown[]>;
// }
export interface ITransformer {
  transform(rows: Record<string, unknown>[], profile: unknown): Promise<Record<string, unknown>[]>;
}
// export interface ITransformer {
// transform(rows: Record<string, unknown>[], profile: unknown): Promise<MyDTO[]>;
// }

export interface IValidator {
  validate(items: unknown[]): Promise<{ ok: boolean; errors: string[] }>;
}

export interface ILoader {
  load(items: unknown[]): Promise<{ successCount: number; failCount: number }>;
}
