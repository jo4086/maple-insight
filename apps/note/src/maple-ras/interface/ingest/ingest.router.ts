// File: /src/interface/ingest/ingest.router.ts

import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import multer from 'multer';

import { IngestContoller } from './IngestController';

import { ExecuteIngestUseCase } from '@/application/ingest/ExecuteIngestUseCase';
import { MyLoader } from '@/infrastructure/ingest/loader/MyLoader';
import { CsvToJsonParser } from '@/infrastructure/ingest/parser/CsvToJsonParser';
import { PassThroughTransformer } from '@/infrastructure/ingest/transformer/PassThroughTransformer';
// import { MyTransformer } from '@/infrastructure/ingest/transformer/MyTransformer';
import { BasicValidator } from '@/infrastructure/ingest/validator/BasicValidator';

console.log('ingest 라우터 접속');

const upload = multer({ dest: 'upload/' });
const router: ExpressRouter = Router();

// ✅ 의존성 인스턴스 생성
const parser = new CsvToJsonParser();
const transformer = new PassThroughTransformer();
const validator = new BasicValidator();
const loader = new MyLoader();

const executeUseCase = new ExecuteIngestUseCase(parser, transformer, validator, loader);
const controller = new IngestContoller(executeUseCase);

// ✅ 경로 수정
router.post('/upload', upload.array('files'), controller.execute);

export default router;
