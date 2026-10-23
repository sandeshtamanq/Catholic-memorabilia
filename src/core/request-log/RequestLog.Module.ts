import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiAccessLog } from './ApiAccessLog.Entity';
import { ApiAccessLogService } from './ApiAccessLog.Service';
import { RequestLoggerMiddleware } from './RequestLogger.Middleware';

@Module({
  imports: [TypeOrmModule.forFeature([ApiAccessLog])],
  providers: [ApiAccessLogService, RequestLoggerMiddleware],
  exports: [ApiAccessLogService],
})
export class RequestLogModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
