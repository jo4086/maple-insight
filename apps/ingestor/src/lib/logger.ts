import pino from 'pino';

const defaultLogFilePath = 'logs/ingestor.log';
const logFilePath = process.env.LOG_FILE_PATH || defaultLogFilePath;

// INFO: ingestor 전역 로거다. 콘솔과 파일에 동시에 기록한다.
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      ...(process.env.NODE_ENV !== 'production'
        ? [
            {
              target: 'pino-pretty',
              level: process.env.LOG_LEVEL || 'info',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          ]
        : [
            {
              target: 'pino/file',
              level: process.env.LOG_LEVEL || 'info',
              options: {
                destination: 1,
              },
            },
          ]),
      {
        target: 'pino/file',
        level: process.env.LOG_LEVEL || 'info',
        options: {
          destination: logFilePath,
          mkdir: true,
        },
      },
    ],
  },
});

export default logger;
