import { TypeOrmModule } from '@nestjs/typeorm';
import { Bundle } from './entities/Bundle.Entity';
import { BundleItem } from './entities/BundleItem.Entity';

export class BundleDIToken {
  static readonly bundleEntity = TypeOrmModule.forFeature([Bundle, BundleItem]);
}
