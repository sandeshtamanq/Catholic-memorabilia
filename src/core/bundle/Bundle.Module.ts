import { Module } from '@nestjs/common';
import { BundleController } from './Bundle.Controller';
import { BundleService } from './Bundle.Service';
import { BundleDIToken } from './BundleDIToken';
import { ProductDIToken } from '../product/ProductDIToken';

@Module({
  imports: [BundleDIToken.bundleEntity, ProductDIToken.productEntity],
  controllers: [BundleController],
  providers: [BundleService],
  exports: [BundleService],
})
export class BundleModule {}
