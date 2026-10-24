import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { RolesGuard } from '../auth/guards/Roles.Guard';
import { User } from './entities/User.Entity';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { UserService } from './User.Service';
import { hasRoles } from '../../lib/decorators/Roles.Decorator';
import { UserRole } from './entities/UserRole.Enum';
import { CreateStaffUserDto } from './dto/CreateStaffUserDto';

@ApiTags('users')
@Controller('api/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiResponse({ type: [User] })
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiResponse({ type: User })
  @Post()
  createUser(@Body() createUserDto: CreateStaffUserDto) {
    return this.userService.createUser({
      ...createUserDto,
      role: createUserDto.role ?? UserRole.User,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: User })
  @Get('me')
  getMe(@CurrentUser() userId: number) {
    return this.userService.findOne(userId);
  }
}
