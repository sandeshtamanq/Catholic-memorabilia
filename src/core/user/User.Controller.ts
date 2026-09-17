import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { User } from './entities/User.Entity';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { UserService } from './User.Service';

@ApiTags('users')
@Controller('api/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: User })
  @Get('me')
  getMe(@CurrentUser() userId: number) {
    return this.userService.findOne(userId);
  }
}
