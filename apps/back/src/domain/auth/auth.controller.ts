import { createSuccessResponse } from '@/types';

import { maskApiKey } from './auth.service';
import type { AuthSession } from './auth.types';

function getAuthSession(req: Parameters<AppHandler>[0]): AuthSession {
  return req.session as AuthSession;
}

const getMe: AppHandler = (req, res) => {
  const session = getAuthSession(req);

  res.status(200).json(
    createSuccessResponse({
      nexonApiKey: session.nexonApiKeyLast4 ? maskApiKey(session.nexonApiKeyLast4) : null,
    }),
  );
};

const registerNexonApiKey: AppHandler<object, unknown, { apiKey?: string }> = (req, res, next) => {
  const apiKey = req.body.apiKey?.trim();

  if (!apiKey) {
    return next?.({
      statusCode: 400,
      message: 'Nexon API Key is required',
    });
  }

  const session = getAuthSession(req);

  session.nexonApiKey = apiKey;
  session.nexonApiKeyLast4 = apiKey.slice(-4);

  res.status(200).json(
    createSuccessResponse({
      nexonApiKey: maskApiKey(session.nexonApiKeyLast4),
    }),
  );
};

const logout: AppHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next?.({
        statusCode: 500,
        message: 'Logout failed',
      });
    }

    res.clearCookie('mapleInsight.sid');
    res.status(200).json(createSuccessResponse({ ok: true }));
    return;
  });
};

const authController = {
  getMe,
  logout,
  registerNexonApiKey,
};

export default authController;
