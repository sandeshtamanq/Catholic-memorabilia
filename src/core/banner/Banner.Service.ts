import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3StorageService } from '../../infra/supabase/Supabase.Service';
import { CreateBannerDto } from './dto/CreateBannerDto';
import { UpdateBannerDto } from './dto/UpdateBannerDto';
import { BannerRepository } from './Banner.Repository';
import { Banner } from './entities/Banner.Entity';

@Injectable()
export class BannerService {
  constructor(
    private readonly bannerRepository: BannerRepository,
    private readonly supabaseService: S3StorageService,
  ) {}

  async create(file: Express.Multer.File, createBannerDto: CreateBannerDto) {
    try {
      if (!file) {
        throw new BadRequestException('Banner image is required');
      }

      const payload: Partial<Banner> = {
        ...createBannerDto,
        isPublished: createBannerDto.isPublished ?? false,
      };

      const filePath = `banners/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      payload.imageUrl = await this.supabaseService.uploadFile(
        'proj',
        filePath,
        file,
      );

      const banner = await this.bannerRepository.create(payload);
      if (!banner) throw new NotFoundException();

      return banner;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw new BadRequestException('Banner image is required');
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException('Banner could not be created');
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async fetchAll(query?: {
    page?: number;
    limit?: number;
    published?: boolean;
  }) {
    try {
      const page = query?.page ?? 1;
      const limit = query?.limit ?? 10;
      const published = query?.published;

      const result = await this.bannerRepository.findAll({
        page,
        limit,
        published,
      });

      if (!result) throw new NotFoundException();

      return result;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Banners not found');
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async fetchPublished() {
    try {
      return await this.bannerRepository.findPublished();
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async fetchDetail(id: number) {
    try {
      const banner = await this.bannerRepository.findOne(id);

      if (!banner) throw new NotFoundException('Banner not found');
      return banner;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Banner not found');
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async update(
    id: number,
    updateBannerDto: UpdateBannerDto & { bannerImage?: Express.Multer.File },
  ) {
    try {
      const banner = await this.bannerRepository.findOne(id);
      if (!banner) throw new NotFoundException('Banner not found');

      if (updateBannerDto.bannerImage) {
        const filePath = `banners/${Date.now()}-${updateBannerDto.bannerImage.originalname.replace(/\s+/g, '-')}`;
        banner.imageUrl = await this.supabaseService.uploadFile(
          'proj',
          filePath,
          updateBannerDto.bannerImage,
        );
      }

      if (updateBannerDto.title !== undefined) {
        banner.title = updateBannerDto.title;
      }

      if (updateBannerDto.description !== undefined) {
        banner.description = updateBannerDto.description;
      }

      if (updateBannerDto.isPublished !== undefined) {
        banner.isPublished = updateBannerDto.isPublished;
      }

      const { bannerImage, ...restBanner } = updateBannerDto;
      const updatedBanner = await this.bannerRepository.update({
        ...banner,
        ...restBanner,
      });

      if (!updatedBanner)
        throw new NotFoundException('Banner could not be updated');

      return updatedBanner;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Banner not found');
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async togglePublish(id: number) {
    try {
      const banner = await this.bannerRepository.findOne(id);
      if (!banner) throw new NotFoundException('Banner not found');

      banner.isPublished = !banner.isPublished;
      const updatedBanner = await this.bannerRepository.update(banner);

      if (!updatedBanner) {
        throw new NotFoundException('Banner could not be updated');
      }

      return updatedBanner;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Banner not found');
      }

      throw new HttpException('Something went wrong', 500);
    }
  }

  async delete(id: number) {
    try {
      const banner = await this.bannerRepository.findOne(id);
      if (!banner) throw new NotFoundException('Banner not found');

      await this.bannerRepository.softRemove(banner);
      return { message: 'Banner deleted successfully' };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Banner not found');
      }

      throw new HttpException('Something went wrong', 500);
    }
  }
}
