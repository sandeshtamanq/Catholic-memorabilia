import { Module } from '@nestjs/common';
import { MailModule } from './mail/Mail.Module';
import { FirebaseModule } from './supabase/Supabase.Module';
import { UploadModule } from './upload/Upload.Module';

@Module({
  imports: [MailModule, FirebaseModule, UploadModule],
})
export class InfraModule {}
