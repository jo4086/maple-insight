import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import session from 'express-session';
import morgan from 'morgan';
// import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const cookieSecret = process.env.COOKIE_SECRET;
const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function getCookieSecret() {
  if (!cookieSecret && isProduction) {
    throw new Error('COOKIE_SECRET is required in production.');
  }

  return cookieSecret || 'dev-cookie-secret';
}

function expressLoader(app: Application) {
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (frontendOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(getCookieSecret()));

  // app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: getCookieSecret(),
      proxy: isProduction,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'lax',
      },
      name: 'mapleInsight.sid',
    }),
  );

  // app.options('*', cors());
}

export default expressLoader;
