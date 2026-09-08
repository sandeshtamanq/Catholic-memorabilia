import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.Entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}
  async create(user: Partial<User>) {
    try {
      console.log(user);
      const createdUser = await this.repository.save(
        this.repository.create(user),
      );
      console.log('createdUser');
      if (!createdUser) {
        return null;
      }
      console.log(createdUser);
      return this.findOne(createdUser.id);
    } catch (err) {
      console.log(err);
      return null;
    }
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
}
