import { Module } from '@nestjs/common';
import { BundleController } from './Bundle.Controller';
import { BundleService } from './Bundle.Service';
import { BundleDIToken } from './BundleDIToken';
import { ProductDIToken } from '../product/ProductDIToken';
import { S3StorageService } from '../../infra/supabase/Supabase.Service';

@Module({
  imports: [BundleDIToken.bundleEntity, ProductDIToken.productEntity],
  controllers: [BundleController],
  providers: [BundleService, S3StorageService],
  exports: [BundleService],
})
export class BundleModule {}
