import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeParamDto } from '../../lib/utils/UserTypeParamDto';
import { User } from './entities/User.Entity';
import { UserRole } from './entities/UserRole.Enum';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}
  async create(user: Partial<User>) {
    try {
      const createdUser = await this.repository.save(
        this.repository.create(user),
      );
      if (!createdUser) {
        return null;
      }
      return this.findOne(createdUser.id);
    } catch (err) {
      return null;
    }
  }

  async find(userType: UserTypeParamDto) {
    const query = this.repository.createQueryBuilder('u');
    if (userType.userType === UserRole.User) {
      query.where('u.role = :role', { role: userType.userType });
    } else {
      query.where('u.role = :role', { role: userType.userType });
    }
    return query.getMany();
  }

  async findAll() {
    return this.repository
      .createQueryBuilder('u')
      .orderBy('u.lastLoginAt', 'DESC', 'NULLS LAST')
      .addOrderBy('u.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    return this.repository
      .createQueryBuilder('u')
      .where('u.id = :id', { id })
      .getOne();
  }

  async findOneBy(by: { email: string }) {
    return this.repository
      .createQueryBuilder('u')
      .where('u.email = :email', { email: by.email })
      .getOne();
  }

  async update(user: Partial<User>) {
    try {
      const preloaded = await this.repository.preload({ ...user });

      const updatedUser = await this.repository.save({ ...preloaded });

      if (!updatedUser) {
        return null;
      }

      return this.findOne(updatedUser.id);
    } catch (err) {
      return null;
    }
  }

  async softRemove(user: Partial<User>) {
    await this.repository.softRemove(user);
  }
}
