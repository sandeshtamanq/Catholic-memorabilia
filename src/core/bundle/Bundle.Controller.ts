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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import 'multer';
import { hasRoles } from '../../lib/decorators/Roles.Decorator';
import { Public } from '../../lib/decorators/Public.Decorator';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { RolesGuard } from '../auth/guards/Roles.Guard';
import { UserRole } from '../user/entities/UserRole.Enum';
import { BundleItemDto } from './dto/BundleItemDto';
import { CreateBundleDto } from './dto/CreateBundleDto';
import { UpdateBundleDto } from './dto/UpdateBundleDto';
import { BundleService } from './Bundle.Service';
import { BundleStatus } from './entities/BundleStatus.Enum';

@ApiTags('bundles')
@Controller('api/bundles')
@UseInterceptors(ClassSerializerInterceptor)
export class BundleController {
  constructor(private readonly bundleService: BundleService) {}

  @Public()
  @Get('published')
  getPublishedBundles() {
    return this.bundleService.findPublishedBundles();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Get()
  getAllBundles() {
    return this.bundleService.findAllBundles();
  }

  @Public()
  @Get(':id')
  getBundleById(@Param('id', ParseIntPipe) id: number) {
    return this.bundleService.findBundleById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Post()
  createBundle(@Body() dto: CreateBundleDto) {
    return this.bundleService.createBundle(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Patch(':id')
  updateBundle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBundleDto,
  ) {
    return this.bundleService.updateBundle(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Post(':id/items')
  addBundleItem(
    @Param('id', ParseIntPipe) bundleId: number,
    @Body() dto: BundleItemDto,
  ) {
    return this.bundleService.addBundleItem(bundleId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Patch(':id/items/:productId')
  updateBundleItem(
    @Param('id', ParseIntPipe) bundleId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body('quantity') quantity: number,
  ) {
    return this.bundleService.updateBundleItem(bundleId, productId, quantity);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Delete(':id/items/:productId')
  removeBundleItem(
    @Param('id', ParseIntPipe) bundleId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.bundleService.removeBundleItem(bundleId, productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Patch(':id/stock')
  updateBundleStock(
    @Param('id', ParseIntPipe) bundleId: number,
    @Body('stockQuantity') stockQuantity: number,
  ) {
    return this.bundleService.updateBundleStock(bundleId, stockQuantity);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Patch(':id/status')
  updateBundleStatus(
    @Param('id', ParseIntPipe) bundleId: number,
    @Body('status') status: BundleStatus,
  ) {
    return this.bundleService.updateBundleStatus(bundleId, status);
  }
}
