import type { NextFunction, Request, Response } from 'express';

import { createAppError } from '@/errors/app-error';

type CharacterLookupQuery = {
  nick: string;
  date?: string | null;
};

export function validateCharacterLookupQuery(req: Request<object, unknown, unknown, CharacterLookupQuery>, _res: Response, next: NextFunction) {
  const query = req.query;

  const nick = typeof query.nick === 'string' ? query.nick.trim() : '';
  const date = typeof query.date === 'string' ? query.date : null;

  if (!nick) {
    return next(createAppError(400, '캐릭터 닉네임이 필요합니다.'));
  }

  query.nick = nick;
  query.date = date;

  return next();
}
