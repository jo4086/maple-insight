// File: /src/application/ingest/ExecuteIngestUseCase.ts
import { ImportBatch } from '@/domain/ingest/entities/ImportBatch';
import type { IParser, ITransformer, IValidator, ILoader } from '@/domain/ingest/services/IParser';
// import type { MyDTO } from '@/domain/ingest/types/MyDTO';

export interface ExecuteIngestParams {
  batch: ImportBatch;
  filePath: string;
  transformProfile: Record<string, unknown>;
  streaming?: boolean;
}

export class ExecuteIngestUseCase {
  constructor(
    private readonly parser: IParser,
    private readonly transformer: ITransformer,
    private readonly validator: IValidator,
    private readonly loader: ILoader,
  ) {}

  async execute({ batch, filePath, transformProfile, streaming }: ExecuteIngestParams) {
    batch.advance('PARSING');

    if (streaming && this.parser.parseStream) {
      // 대형 파일 모드: 바로바로 변환/검증/버퍼 적재
      const transformedItems: unknown[] = [];
      await this.parser.parseStream(filePath, async (row) => {
        // const transformed: MyDTO[] = await this.transformer.transform([row], transformProfile);
        // transformedItems.push(...transformed);

        const transformed: Record<string, unknown>[] = await this.transformer.transform([row], transformProfile);
        transformedItems.push(...transformed);
      });

      batch.advance('VALIDATING');
      const { ok, errors } = await this.validator.validate(transformedItems);
      if (!ok) throw new Error(`Validation failed: ${errors.slice(0, 5).join(', ')}`);

      batch.advance('LOADING');
      const loadRes = await this.loader.load(transformedItems);

      batch.advance('COMPLETED');
      return { count: loadRes.successCount };
    }

    // 기본(소형 파일) 모드
    const { rows } = await this.parser.parse(filePath);
    batch.advance('TRANSFORMING');
    const transformed = await this.transformer.transform(rows, transformProfile);

    batch.advance('VALIDATING');
    const { ok, errors } = await this.validator.validate(transformed);
    if (!ok) throw new Error(`Validation failed: ${errors.slice(0, 5).join(', ')}`);

    batch.advance('LOADING');
    const loadRes = await this.loader.load(transformed);

    batch.advance('COMPLETED');
    return { count: loadRes.successCount };
  }
}

// export class ExecuteIngestUseCase {
//   constructor(
//     private readonly parser: IParser,
//     private readonly transformer: ITransformer,
//     private readonly validator: IValidator,
//     private readonly loader: ILoader,
//   ) {}
//
//   async execute({ batch, filePath, transformProfile, streaming }: Params) {
//     batch.advance('PARSING');
//
//     if (streaming && this.parser.parseStream) {
//       const transformedItems: unknown[] = [];
//       await this.parser.parseStream(filePath, (row) => {
//         const t = this.transformer.transform([row], transformProfile);
//         transformedItems.push(...(t as unknown[]));
//       });
//     }
//
//     const parsed = await this.parser.parse(filePath);
//
//     batch.advance('TRANSFORMING');
//     const transformed = await this.transformer.transform(parsed.rows, transformProfile);
//
//     batch.advance('VALIDATING');
//     const { ok, errors } = await this.validator.validate(transformed);
//     if (!ok) throw new Error(`Validation failed: ${errors.slice(0, 3).join(', ')}...`);
//
//     batch.advance('LOADING');
//     const loadRes = await this.loader.load(transformed);
//
//     batch.advance('COMPLETED');
//     return { count: loadRes.successCount };
//   }
// }
