import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ApiAccessLogService } from './ApiAccessLog.Service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly apiAccessLogService: ApiAccessLogService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();
    let completed = false;

    const finalizeRequest = (): void => {
      if (completed) {
        return;
      }

      completed = true;

      void this.apiAccessLogService
        .logRequest(req, res, startedAt)
        .catch((error) => {
          console.error('Request logging failed:', error);
        });
    };

    res.on('finish', finalizeRequest);
    res.on('close', finalizeRequest);
    next();
  }
}
