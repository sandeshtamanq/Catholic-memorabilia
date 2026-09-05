import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LogInDto } from './dto/LoginDto';
import { SignUpDto } from './dto/SignUpDto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/User.Entity';
import { UserService } from '../user/User.Service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneBy({ email: username });
    if (!user) throw new UnauthorizedException('User is not registered!');

    if (user.deletedAt)
      throw new UnauthorizedException('User account has been already deleted!');

    const isPassValid = await this.comparePassword(password, user.password);
    if (!isPassValid) throw new UnauthorizedException('Invalid email/password');
    return user;
  }

  async login(user: User) {
    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    const token = await this.generateJwt(payload);
    return { user, token };
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const hashedPassword = await this.hashPassword(signUpDto.password);
      const user = await this.userService.createUser({
        ...signUpDto,
        password: hashedPassword,
      });
      return user;
    } catch (err) {
      throw new HttpException(err.message, 500);
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async generateJwt(payload: Partial<User>): Promise<string> {
    return this.jwtService.sign({ user: payload });
  }
}
