import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../infra/supabase/Supabase.Module';
import { BannerController } from './Banner.Controller';
import { BannerRepository } from './Banner.Repository';
import { BannerService } from './Banner.Service';
import { BannerDIToken } from './BannerDIToken';

@Module({
  imports: [FirebaseModule, BannerDIToken.BannerEntity],
  controllers: [BannerController],
  providers: [BannerService, BannerRepository],
  exports: [BannerService],
})
export class BannerModule {}
