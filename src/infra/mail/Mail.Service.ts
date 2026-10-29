import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../../core/user/entities/User.Entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  private normalizeOrderItems(order: any) {
    return (order?.items ?? []).map((item: any) => ({
      ...item,
      productName:
        item?.product?.name ??
        item?.productName ??
        `Product ${item?.productId ?? 'Unknown'}`,
      quantity: Number(item?.quantity ?? 1),
      totalPrice: Number(
        item?.totalPrice ?? item?.priceAfterDiscount ?? item?.unitPrice ?? 0,
      ).toFixed(2),
    }));
  }

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

  async sendOrderConfirmation(email: string, order: any) {
    const items = this.normalizeOrderItems(order);

    await this.mailerService.sendMail({
      to: email,
      subject: `Order Confirmation - ${order.orderNumber ?? '#order'}`,
      template: './order-confirmation',
      context: {
        customerName: order.customerName ?? 'Customer',
        orderNumber: order.orderNumber ?? '#order',
        status: order.status ?? 'PENDING',
        items,
        totalAmount: Number(order.totalAmount ?? 0).toFixed(2),
        shippingFee: Number(order.shippingFee ?? 0).toFixed(2),
        createdAt: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
      },
    });
  }

  async sendOrderStatusUpdate(email: string, order: any) {
    const items = this.normalizeOrderItems(order);

    await this.mailerService.sendMail({
      to: email,
      subject: `Order Update - ${order.orderNumber ?? '#order'}`,
      template: './order-status-update',
      context: {
        customerName: order.customerName ?? 'Customer',
        orderNumber: order.orderNumber ?? '#order',
        status: order.status ?? 'PENDING',
        items,
        totalAmount: Number(order.totalAmount ?? 0).toFixed(2),
        shippingFee: Number(order.shippingFee ?? 0).toFixed(2),
      },
    });
  }
}
