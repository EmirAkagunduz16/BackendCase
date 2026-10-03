import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { TokenPayload } from '../token-payload.interface.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    try {
      const user = await this.usersService.getUser({ _id: payload.userId });
      return this.usersService.toEntity(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Token is not valid.');
      }
      throw error;
    }
  }
}
