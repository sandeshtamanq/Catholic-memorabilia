import { Module } from '@nestjs/common';
import { S3StorageService } from './Supabase.Service';

@Module({
  providers: [S3StorageService],
  exports: [S3StorageService],
})
export class FirebaseModule {}
