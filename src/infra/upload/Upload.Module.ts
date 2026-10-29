import { Module } from '@nestjs/common';
import { FirebaseModule } from '../supabase/Supabase.Module';
import { UploadController } from './Upload.Controller';
import { UploadService } from './Upload.Service';

@Module({
  imports: [FirebaseModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
