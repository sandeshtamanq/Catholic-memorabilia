import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { hasRoles } from '../../lib/decorators/Roles.Decorator';
import { PaginationQueryDto } from '../../lib/utils/PaginationQueryDto';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { RolesGuard } from '../auth/guards/Roles.Guard';
import { UserRole } from '../user/entities/UserRole.Enum';
import { CreateBannerDto } from './dto/CreateBannerDto';
import { UpdateBannerDto } from './dto/UpdateBannerDto';
import { BannerService } from './Banner.Service';
import { Banner } from './entities/Banner.Entity';

@ApiTags('banners')
@Controller('api/banners')
@UseInterceptors(ClassSerializerInterceptor)
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @ApiResponse({ type: Banner, isArray: true })
  fetchAll(@Query() query: PaginationQueryDto & { published?: boolean }) {
    return this.bannerService.fetchAll(query);
  }

  @Get('published')
  fetchPublished() {
    return this.bannerService.fetchPublished();
  }

  @Get(':id')
  fetchDetail(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.fetchDetail(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @hasRoles(UserRole.Admin)
  @UseInterceptors(FileInterceptor('bannerImage'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() bannerImage: Express.Multer.File,
  ) {
    return this.bannerService.create(bannerImage, createBannerDto);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @hasRoles(UserRole.Admin)
  @UseInterceptors(FileInterceptor('bannerImage'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() bannerImage: Express.Multer.File,
  ) {
    return this.bannerService.update(id, {
      bannerImage,
      ...updateBannerDto,
    });
  }

  @ApiBearerAuth()
  @hasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/toggle-publish')
  togglePublish(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.togglePublish(id);
  }

  @ApiBearerAuth()
  @hasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.delete(id);
  }
}
