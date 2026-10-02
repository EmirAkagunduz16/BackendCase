import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import type { User } from '../users/entities/user.entity.js';
import type { TokenPayload } from './token-payload.interface.js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
    });
    return this.login(user);
  }

  async login(user: Pick<User, '_id' | 'role'>) {
    const tokenPayload: TokenPayload = {
      _id: user._id.toHexString(),
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
      jwtid: randomUUID(),
    });
    await this.usersService.updateRefreshToken(tokenPayload._id, refreshToken);
    return { accessToken, refreshToken };
  }

  async refresh() {}
}
