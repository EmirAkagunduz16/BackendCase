import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import type { User } from '../users/entities/user.entity.js';
import type { TokenPayload } from './token-payload.interface.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
    });
  }

  async login(user: User, response: Response) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) } },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });

    return { accessToken, refreshToken };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email: email.trim().toLowerCase(),
      });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
      return this.usersService.toEntity(user);
    } catch (error) {
      if (!(
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      )) {
        throw error;
      }
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({ _id: userId });
      if (!user) {
        throw new NotFoundException('User with that id is not found.');
      }
      const isValidRefresh = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash!,
      );
      if (!isValidRefresh) {
        throw new UnauthorizedException('Refresh token is not valid.');
      }
      return this.usersService.toEntity(user);
    } catch {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
