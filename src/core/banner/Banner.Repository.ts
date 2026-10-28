import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/Banner.Entity';

@Injectable()
export class BannerRepository {
  constructor(
    @InjectRepository(Banner)
    private readonly repository: Repository<Banner>,
  ) {}

  async create(banner: Partial<Banner>) {
    try {
      const createdBanner = await this.repository.save(
        this.repository.create(banner),
      );

      if (!createdBanner) return null;

      return this.findOne(createdBanner.id);
    } catch (err) {
      return null;
    }
  }

  async findOne(id: number) {
    return this.repository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .getOne();
  }

  async findAll(opts?: { page?: number; limit?: number; published?: boolean }) {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 10;
    const published = opts?.published;

    const query = this.repository.createQueryBuilder('b');

    if (published !== undefined) {
      query.where('b.isPublished = :published', { published });
    }

    const [items, total] = await query
      .orderBy('b.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublished() {
    return this.repository
      .createQueryBuilder('b')
      .where('b.isPublished = :isPublished', { isPublished: true })
      .orderBy('b.createdAt', 'DESC')
      .getMany();
  }

  async update(banner: Partial<Banner>) {
    try {
      const preloaded = await this.repository.preload({ ...banner });

      if (!preloaded) {
        return null;
      }

      const updatedBanner = await this.repository.save(preloaded);
      if (!updatedBanner) return null;

      return this.findOne(updatedBanner.id);
    } catch (err) {
      return null;
    }
  }

  async softRemove(banner: Banner) {
    await this.repository.delete(banner.id);
  }
}
