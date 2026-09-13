import { Module } from '@nestjs/common';
import { MailModule } from './mail/Mail.Module';
import { FirebaseModule } from './supabase/Supabase.Module';

@Module({
  imports: [MailModule, FirebaseModule],
})
export class InfraModule {}
