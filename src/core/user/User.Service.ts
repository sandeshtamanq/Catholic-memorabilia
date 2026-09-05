import { BadRequestException, Injectable } from '@nestjs/common';
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

  async findOneBy(by: { email: string }) {
    return this.userRepository.findOneBy(by);
  }
}
