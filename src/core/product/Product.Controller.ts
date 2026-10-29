import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { hasRoles } from '../../lib/decorators/Roles.Decorator';
import { CurrentUser } from '../../lib/decorators/CurrentUser.Decorator';
import { JwtAuthGuard } from '../auth/guards/JwtAuth.Guard';
import { RolesGuard } from '../auth/guards/Roles.Guard';
import { UserRole } from '../user/entities/UserRole.Enum';
import { ProductService } from './Product.Service';
import { CreateProductDto } from './dto/CreateProductDto';
import { UpdateProductDto } from './dto/UpdateProductDto';
import {
  GeneratedProductDto,
  GenerateProductDto,
} from './dto/GenerateProductDto';
import { PaginationQueryDto } from '../../lib/utils/PaginationQueryDto';

@ApiTags('products')
@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  fetchAll(@Query() query: PaginationQueryDto) {
    return this.productService.fetchAll(query);
  }

  @Get('new-arrivals')
  fetchNewArrivals(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productService.fetchNewArrivals(limit);
  }

  @Get('featured')
  fetchFeaturedProducts(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productService.fetchFeaturedProducts(limit);
  }

  // @Get('offers')
  // fetchOffers(
  //   @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  // ) {
  //   return this.productService.fetchOfferProducts(limit);
  // }

  // @Get('just-for-you')
  // fetchJustForYou(
  //   @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  // ) {
  //   return this.productService.fetchJustForYou(limit);
  // }

  // @Get('search')
  // searchByCategory(
  //   @Query('categoryId') categoryId?: string,
  //   @Query('categoryName') categoryName?: string,
  // ) {
  //   return this.productService.searchByCategory({
  //     categoryId: categoryId ? Number(categoryId) : undefined,
  //     categoryName,
  //   });
  // }

  @Get('suggest')
  suggest(
    @Query('type') type: 'product' | 'category',
    @Query('keyword') keyword: string,
  ) {
    return this.productService.suggest(type, keyword);
  }

  @Get('related/:categoryId')
  fetchRelatedProducts(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.productService.fetchRelatedProducts(categoryId, query);
  }

  @Get('suggestions')
  fetchSuggestionsForUser(
    @CurrentUser() userId: number | null,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productService.fetchSuggestionsForUser(userId, limit);
  }

  @Get('recommendations')
  fetchRecommendations(
    @CurrentUser() userId: number | null,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productService.fetchSuggestionsForUser(userId, limit);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  getFavorites(@CurrentUser() userId: number) {
    return this.productService.getFavorites(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  toggleFavorite(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) productId: number,
  ) {
    return this.productService.toggleFavorite(userId, productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  deleteFavorite(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) productId: number,
  ) {
    return this.productService.removeFavorite(userId, productId);
  }

  @Get(':id')
  fetchDetail(@Param('id', ParseIntPipe) id: number) {
    return this.productService.fetchDetail(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('productImage'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() productImage: Express.Multer.File,
  ) {
    return this.productService.create(productImage, createProductDto);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('productImage'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() productImage: Express.Multer.File,
  ) {
    return this.productService.update(id, {
      productImage,
      ...updateProductDto,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('productImage'))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRole.Admin)
  @Post('generate-listing')
  generateListing(
    @Body() generateProductDto: GenerateProductDto,
    @UploadedFile() productImage: Express.Multer.File,
  ): Promise<GeneratedProductDto> {
    return this.productService.generateFromImage(productImage);
  }
}
