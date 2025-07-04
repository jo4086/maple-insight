import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import session from 'express-session';
import morgan from 'morgan';
// import path from 'path';


const cookieSecret = process.env.COOKIE_SECRET || 'secret';

function expressLoader(app: Application) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }),
  );

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(cookieSecret));

  // app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

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

  // app.options('*', cors());
}

export default expressLoader;
