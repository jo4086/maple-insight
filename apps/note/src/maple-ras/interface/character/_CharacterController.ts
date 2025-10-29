// 📁 interface/character/CharacterController.ts
import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import { SearchCharacterUseCase } from '../../application/character/SearchCharacterUseCase';
import { NexonCharacterGateway } from '../../infrastructure/character/NexonCharacterGateway';

console.log('인터페이스 접속on');

const router: ExpressRouter = Router();
const gateway = new NexonCharacterGateway();
const searchCharacter = new SearchCharacterUseCase(gateway);

router.get('/search', async (req, res) => {
  try {
    const { nick, date = null } = req.query as { nick: string; date?: string };
    const result = await searchCharacter.execute(nick, date);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '캐릭터 조회 실패',
    });
  }
});

export default router;
