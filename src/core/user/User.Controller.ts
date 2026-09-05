import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  @ApiBearerAuth()
  @Post()
  create() {
    return 'sup';
  }
}
