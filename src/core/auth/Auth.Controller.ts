import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LogInDto } from './dto/LoginDto';
import { SignUpDto } from './dto/SignUpDto';
import { AuthService } from './Auth.Service';
import { LocalAuthGuard } from './guards/LocalAuth.Guard';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/JwtAuth.Guard';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { User } from '../user/entities/User.Entity';
import { instanceToPlain } from 'class-transformer';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LogInDto })
  async login(@Req() req: any, @Res() response: Response) {
    const guestId = req.cookies?.guestId ?? req.body?.guestId;
    const data: { user: User; token: string; cart: any[]; isGuest: boolean } =
      await this.authService.login(req.user, guestId);

    const userResponse = instanceToPlain(data);

    response
      .cookie('token', data.token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        sameSite: 'none',
      })
      .clearCookie('guestId')
      .send({
        token: userResponse.token,
        user: userResponse.user,
        cart: userResponse.cart ?? [],
        isGuest: userResponse.isGuest,
      });
  }

  @Post(['guest', 'guest-checkout', 'guest-login'])
  async guestCheckout(@Req() req: any, @Res() response: Response) {
    const guestId = req.cookies?.guestId ?? req.body?.guestId ?? `guest-${Date.now()}`;
    const cart = req.body?.cart ?? [];
    const result = await this.authService.createGuestSession(guestId, cart);

    response
      .cookie('guestId', result.guestId, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        sameSite: 'none',
      })
      .send(result);
  }

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('test')
  test(@CurrentUser() user: number) {
    return 'sup';
  }
}
