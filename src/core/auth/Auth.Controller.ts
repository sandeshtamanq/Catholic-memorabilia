import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
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
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LogInDto })
  async login(@Req() req: any, @Res() response: Response) {
    const data: { user: User; token: string } = await this.authService.login(
      req.user,
    );

    const userResponse = instanceToPlain(data);

    response
      .cookie('token', data.token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        sameSite: 'none',
      })
      .send({
        ...userResponse.user,
      });
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
