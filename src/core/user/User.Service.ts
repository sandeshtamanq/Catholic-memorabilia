import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { UserRepository } from './User.Repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async createUser(createUserDto: CreateUserDto) {
    try {
      const userExists = await this.userRepository.findOneBy({
        email: createUserDto.email,
      });

      if (userExists) {
        throw new BadRequestException('User already exists!');
      }
      const user = await this.userRepository.create(createUserDto);
      return user;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne(id);
      if (!user) {
        throw new NotFoundException();
      }

      return user;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async findOneBy(by: { email: string }) {
    return this.userRepository.findOneBy(by);
  }
}
