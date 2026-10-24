import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/AppConfig';
import { CoreModule } from './core/.Core.Module';
import { InfraModule } from './infra/.Infra.Module';
@Module({
  imports: [AppConfigModule, CoreModule, InfraModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
