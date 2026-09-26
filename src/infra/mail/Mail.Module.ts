import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailService } from './Mail.Service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST ?? 'smtp.example.com',
        port: Number(process.env.MAIL_PORT ?? 587),
        secure: (process.env.MAIL_SECURE ?? 'true').toLowerCase() === 'true',
        auth: {
          user: process.env.MAIL_USER ?? 'change-me',
          pass: process.env.MAIL_PASS ?? 'change-me',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(
          process.cwd(),
          process.env.NODE_ENV === 'production'
            ? 'dist/lib/templates'
            : 'src/lib/templates',
        ),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
