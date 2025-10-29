import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import session from 'express-session';
import morgan from 'morgan';

const cookieSecret = process.env.COOKIE_SECRET || 'secret';

function expressLoader(app: Application) {
  app.use(
    cors({
      origin: '*',
      credentials: false,
    }),
  );

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(cookieSecret));

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: cookieSecret,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'lax',
      },
      name: 'mapleInsight.sid',
    }),
  );
}

export default expressLoader;
