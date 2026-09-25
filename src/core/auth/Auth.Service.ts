import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../infra/mail/Mail.Service';
import { UserService } from '../user/User.Service';
import { User } from '../user/entities/User.Entity';
import { UserRole } from '../user/entities/UserRole.Enum';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { SignUpDto } from './dto/SignUpDto';
import { VerifyEmailDto } from './dto/VerifyEmailDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneBy({ email: username });
    if (!user) throw new UnauthorizedException('User is not found!');

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email Not verified please verify your email first',
      );
    }

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
      role: user.role,
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

      const token = this.jwtService.sign(
        { email: user.email },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: `1d`,
        },
      );
      await this.mailService.sendUserConfirmation(user, token);
      return user;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw new BadRequestException(
          `User with email ${signUpDto.email} already exists`,
        );
      }
      throw new HttpException(err, 500);
    }
  }

  async resetPassword(resetpasswordDto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verify(resetpasswordDto.token, {
        secret: process.env.JWT_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        const user = await this.userService.findOneBy({ email: payload.email });

        if (!user) {
          throw new NotFoundException();
        }

        const hashedPassword = await this.hashPassword(
          resetpasswordDto.newPassword,
        );

        const updateUser = await this.userService.update(user.id, {
          ...user,
          password: hashedPassword,
        });
        return updateUser;
      } else {
        throw new UnauthorizedException();
      }
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<User> {
    try {
      const payload = await this.jwtService.verify(verifyEmailDto.token, {
        secret: process.env.JWT_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        const user = await this.userService.findOneBy({ email: payload.email });

        if (!user) {
          throw new NotFoundException();
        }
        const updateUser = await this.userService.update(user.id, {
          ...user,
          isEmailVerified: true,
        });
        return updateUser;
      } else {
        throw new UnauthorizedException();
      }
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<User> {
    try {
      const user = await this.userService.findOneBy({
        email: forgotPasswordDto.email,
      });

      if (!user) {
        throw new NotFoundException();
      }

      const token = this.jwtService.sign(
        { email: user.email },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: `1d`,
        },
      );
      await this.mailService.changePassword(user, token);

      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: number) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user) throw new UnauthorizedException("User doesn't exist");

      const isPassValid = await this.comparePassword(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isPassValid)
        throw new UnauthorizedException('Invalid email/password');

      const hashedPassword = await this.hashPassword(
        changePasswordDto.newPassword,
      );

      const updateUser = await this.userService.update(user.id, {
        ...user,
        password: hashedPassword,
      });
      return updateUser;
    } catch (err) {
      throw new UnauthorizedException();
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
