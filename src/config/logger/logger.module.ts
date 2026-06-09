import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { LoggerModule } from 'nestjs-pino';
import { CORRELATION_ID_HEADER } from 'src/constants/correlation-id';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') === 'development';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
            genReqId: (req, res) => {
              const existing = req.headers[CORRELATION_ID_HEADER];
              const id = existing ?? randomUUID();
              req.headers[CORRELATION_ID_HEADER] = id;
              res.setHeader(CORRELATION_ID_HEADER, id);
              return id;
            },
            redact: {
              paths: [
                'req.header.authorization',
                'req.header.cookies',
                'req.body.password',
                'req.header["set-cookie"]',
              ],
              censor: '[REDACTED]',
            },
            customProps: (req: IncomingMessage) => ({
              userId: (req as IncomingMessage & { user?: { id?: string } })
                ?.user?.id,
            }),
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class PinoLoggerModule {}
