import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/Banner.Entity';

export class BannerDIToken {
  static readonly BannerEntity = TypeOrmModule.forFeature([Banner]);
}
