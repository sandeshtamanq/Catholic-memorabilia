import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../../core/user/entities/User.Entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `${process.env.FE_APP}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to  Confirm your Email',
      template: './confirmation',
      context: {
        name: user.firstName,
        url,
      },
    });
  }

  async changePassword(user: User, token: string) {
    const url = `${process.env.FE_APP}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Your Password',
      template: './password-reset',
      context: {
        name: user.firstName,
        url,
      },
    });
  }
}
