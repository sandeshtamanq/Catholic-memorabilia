import { Module } from '@nestjs/common';
import { MailModule } from './mail/Mail.Module';

@Module({
  imports: [MailModule],
})
export class InfraModule {}
