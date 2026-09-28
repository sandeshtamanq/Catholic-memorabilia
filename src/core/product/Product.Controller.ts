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

@ApiTags('products')
@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  fetchAll() {
    return this.productService.fetchAll();
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

  @Get('related/:categoryId')
  fetchRelatedProducts(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productService.fetchRelatedProducts(categoryId, limit);
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
