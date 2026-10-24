import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserTypeParamDto } from '../../lib/utils/UserTypeParamDto';
// import { USER_DELETE } from '../event-listerner/UserEventListener.Service';
import { UserRepository } from './User.Repository';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserRole } from './entities/UserRole.Enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    // private readonly eventEmitter: EventEmitter2,
  ) {}

  async fetch(userType: UserTypeParamDto) {
    try {
      const users = await this.userRepository.find(userType);
      if (!users) throw new NotFoundException();
      return users;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async getAllUsers() {
    try {
      const users = await this.userRepository.findAll();
      return users;
    } catch (err) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  // async upload(id: number, profileImageUrl: Express.Multer.File) {
  //   try {
  //     const user = await this.userRepository.findOne(id);

  //     if (!user) throw new NotFoundException();

  //     const profileImage = await this.firebaseService.uploadFile(
  //       profileImageUrl,
  //       'profile-images',
  //     );

  //     return this.userRepository.update({
  //       ...user,
  //       profileImageUrl: profileImage,
  //     });
  //   } catch (err) {
  //     if (err instanceof NotFoundException)
  //       throw new NotFoundException('User not found');
  //     throw new HttpException('Something went wrong', 500);
  //   }
  // }

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

  async createUser(createUserDto: CreateUserDto & { role?: UserRole }) {
    try {
      const userExists = await this.userRepository.findOneBy({
        email: createUserDto.email,
      });

      if (userExists) {
        throw new BadRequestException('User already exists!');
      }

      const normalizedRole =
        createUserDto.role === UserRole.Staff ? UserRole.Staff : UserRole.User;

      const user = await this.userRepository.create({
        ...createUserDto,
        role: normalizedRole,
        isEmailVerified: true,
      });
      return user;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException();
    }
  }

  async markLastLogin(userId: number) {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      return null;
    }

    const updatedUser = await this.userRepository.update({
      ...user,
      lastLoginAt: new Date(),
    });

    return updatedUser;
  }

  async findOneBy(by: { email: string }) {
    return this.userRepository.findOneBy(by);
  }

  async update(id: number, updateUserPort: UpdateUserDto) {
    try {
      const existingUser = await this.userRepository.findOneBy({
        email: updateUserPort.email,
      });
      const emailExist = await this.userRepository.findOneBy({
        email: updateUserPort.email,
      });

      if (existingUser.id !== id && emailExist) throw new BadRequestException();
      if (!existingUser) {
        throw new NotFoundException();
      }

      const user = await this.userRepository.update({
        ...existingUser,
        ...updateUserPort,
      });
      const updatedUser = await this.userRepository.findOne(user.id);
      return updatedUser;
    } catch (err) {
      if (err instanceof BadRequestException)
        throw new BadRequestException('Email already exists');
      throw new HttpException('Something went wrong', 500);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOne(id);

      if (!user) throw new NotFoundException();

      await this.userRepository.softRemove(user);
      // this.eventEmitter.emitAsync(USER_DELETE, user);
    } catch (err) {
      if (err instanceof NotFoundException)
        throw new NotFoundException('User not found');
      throw new HttpException('Something went wrong', 500);
    }
  }
}
