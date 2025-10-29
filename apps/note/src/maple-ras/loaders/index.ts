import type { Application } from 'express';
import expressLoader from './express.loader';
import routerLoader from './router.loader';
export function initLoaders(app: Application) {
  try {
    expressLoader(app);
    console.log('express 로드 완료');

    console.log('라우터 로드 시작');
    routerLoader(app);
    console.log('라우터 로드 완료');
  } catch (err) {
    console.error(`loader error:`, err);
  }
}
