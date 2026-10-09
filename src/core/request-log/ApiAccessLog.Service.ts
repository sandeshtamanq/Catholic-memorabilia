import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { ApiAccessLog } from './ApiAccessLog.Entity';

@Injectable()
export class ApiAccessLogService {
  private readonly logger = new Logger(ApiAccessLogService.name);
  private readonly logDirectory = join(process.cwd(), 'logs');
  private readonly logFilePath = join(this.logDirectory, 'api-access.log');

  constructor(
    @InjectRepository(ApiAccessLog)
    private readonly apiAccessLogRepository: Repository<ApiAccessLog>,
  ) {}

  async logRequest(
    req: Request,
    res: Response,
    startedAt: number,
  ): Promise<void> {
    const logEntry = this.prepareLogEntry(req, res, startedAt);

    try {
      await this.writeToFile(logEntry);
    } catch (error) {
      this.logger.warn(
        `Failed to write API access log to file: ${error.message}`,
      );
    }

    try {
      await this.saveToDatabase(logEntry);
    } catch (error) {
      this.logger.warn(
        `Failed to save API access log to database: ${error.message}`,
      );
    }
  }

  prepareLogEntry(req: Request, res: Response, startedAt: number) {
    const user = (req as any).user as {
      id?: number;
      email?: string;
      role?: string;
    };
    const createdAt = new Date();

    return {
      method: req.method,
      path: req.originalUrl || req.url,
      route: (req as any).route?.path || req.originalUrl || req.url,
      userId: user?.id ?? null,
      email: user?.email ?? null,
      role: user?.role ?? null,
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'] ?? null,
      query: this.sanitizePayload(req.query),
      params: this.sanitizePayload(req.params),
      body: this.sanitizePayload(req.body),
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - startedAt,
      createdAt,
    };
  }

  private getClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) {
      return forwardedFor[0] ?? req.socket.remoteAddress ?? 'unknown';
    }

    if (typeof forwardedFor === 'string') {
      return (
        forwardedFor.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown'
      );
    }

    return req.socket.remoteAddress || 'unknown';
  }

  private sanitizePayload(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizePayload(item));
    }

    const sanitized: Record<string, any> = { ...value };
    const redactedKeys = [
      'password',
      'secret',
      'token',
      'authorization',
      'cookie',
      'refreshToken',
      'accessToken',
      'refresh_token',
      'access_token',
    ];

    for (const key of redactedKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private async saveToDatabase(logEntry: Record<string, any>): Promise<void> {
    await this.ensureTableExists();

    const log = this.apiAccessLogRepository.create({
      method: logEntry.method,
      path: logEntry.path,
      route: logEntry.route,
      userId: logEntry.userId,
      email: logEntry.email,
      role: logEntry.role,
      ipAddress: logEntry.ipAddress,
      userAgent: logEntry.userAgent,
      query: logEntry.query,
      params: logEntry.params,
      body: logEntry.body,
      statusCode: logEntry.statusCode,
      responseTimeMs: logEntry.responseTimeMs,
      createdAt: logEntry.createdAt,
    });

    await this.apiAccessLogRepository.save(log);
  }

  private async ensureTableExists(): Promise<void> {
    await this.apiAccessLogRepository.query(`
      CREATE TABLE IF NOT EXISTS api_access_logs (
        id SERIAL PRIMARY KEY,
        method VARCHAR(20) NOT NULL,
        path VARCHAR(255) NOT NULL,
        route VARCHAR(255),
        user_id INTEGER,
        email VARCHAR(255),
        role VARCHAR(64),
        ip_address VARCHAR(255),
        user_agent TEXT,
        query JSONB,
        params JSONB,
        body JSONB,
        status_code INTEGER,
        response_time_ms INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private async writeToFile(logEntry: Record<string, any>): Promise<void> {
    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory, { recursive: true });
    }

    const logLine = JSON.stringify({
      timestamp: new Date(logEntry.createdAt).toISOString(),
      method: logEntry.method,
      path: logEntry.path,
      route: logEntry.route,
      userId: logEntry.userId ?? null,
      email: logEntry.email ?? null,
      role: logEntry.role ?? null,
      ipAddress: logEntry.ipAddress ?? null,
      userAgent: logEntry.userAgent ?? null,
      query: logEntry.query ?? null,
      params: logEntry.params ?? null,
      body: logEntry.body ?? null,
      statusCode: logEntry.statusCode,
      responseTimeMs: logEntry.responseTimeMs,
    });

    appendFileSync(this.logFilePath, `${logLine}\n`, 'utf8');
  }
}
