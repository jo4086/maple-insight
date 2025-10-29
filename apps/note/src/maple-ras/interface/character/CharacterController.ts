import { Request, Response } from 'express';

import { SearchCharacterUseCase } from '@/application/character/SearchCharacterUseCase';

export class CharacterController {
  constructor(private readonly searchCharacter: SearchCharacterUseCase) {}

  search = async (req: Request, res: Response) => {
    try {
      const { nick, date = null } = req.query as { nick: string; date?: string };
      const result = await this.searchCharacter.execute(nick, date);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: '캐릭터 조회 실패',
      });
    }
  };
}
