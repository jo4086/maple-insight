// File: /src/interface/ingest/IngestContoller.ts
import type { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { ExecuteIngestUseCase } from '@/application/ingest/ExecuteIngestUseCase';
import { ImportBatch } from '@/domain/ingest/entities/ImportBatch';

export class IngestContoller {
  constructor(private readonly executeUseCase: ExecuteIngestUseCase) {}

  // 업로드 + 실행
  execute = async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: '파일이 없습니다.' });
      }

      const filePath = req.files[0].path;

      let profile: Record<string, unknown> = {};
      try {
        profile = JSON.parse(req.body?.profile ?? '{}');
      } catch {
        return res.status(400).json({ error: 'profile 파싱 실패' });
      }

      const streaming = req.body?.streaming === 'true';
      const batch = new ImportBatch(uuid());

      const result = await this.executeUseCase.execute({
        batch,
        filePath,
        transformProfile: profile,
        streaming,
      });

      res.json({ ok: true, ...result });
    } catch (error) {
      console.error('[IngestController] 실행 중 오류:', error);
      res.status(500).json({
        ok: false,
        error: (error as Error).message ?? '알 수 없는 오류가 발생했습니다.',
      });
    }
  };
}

// export class IngestContoller {
//   constructor(private readonly executeUseCase: ExecuteIngestUseCase) {}
//
//   // 업로드 + 실행
//   execute = async (req: Request, res: Response) => {
//     if (!req.file) {
//       return res.status(400).json({ error: '파일이 없습니다.' });
//     }
//
//     const filePath = req.file.path;
//     // const profile = req.body?.profile ?? {};
//
//     let profile: Record<string, unknown> = {};
//     try {
//       profile = JSON.parse(req.body?.profile ?? '{}');
//     } catch {
//       return res.status(400).json({ error: 'profile 파싱 실패' });
//     }
//
//     const streaming = req.body?.streaming === 'true';
//
//     const batch = new ImportBatch(uuid());
//
//     const result = await this.executeUseCase.execute({
//       batch,
//       filePath,
//       transformProfile: profile,
//       streaming,
//     });
//
//     res.json({ ok: true, ...result });
//   };
// }
