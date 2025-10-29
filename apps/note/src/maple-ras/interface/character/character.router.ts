import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import { CharacterController } from './CharacterController';

import { SearchCharacterUseCase } from '@/application/character/SearchCharacterUseCase';
import { NexonCharacterGateway } from '@/infrastructure/character/NexonCharacterGateway';

console.log('character 라우터 접속');

const router: ExpressRouter = Router();

// 의존성 주입
const gateway = new NexonCharacterGateway();
const searchCharacter = new SearchCharacterUseCase(gateway);
const controller = new CharacterController(searchCharacter);

// 라우팅
router.get('/search', controller.search);

export default router;
