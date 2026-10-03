import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';
import type { Response } from 'express';
import { RegisterDto } from './dto/register.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBadRequestResponse({ description: 'Invalid registration details.' })
  @ApiConflictResponse({ description: 'Email is already registered.' })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Registered user.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiBadRequestResponse({ description: 'Invalid email or password input.' })
  @ApiUnauthorizedResponse({
    description: 'Incorrect login credentials.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenResponseDto,
    description: 'Authentication tokens.',
  })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Post('refresh')
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid or expired Refresh cookie.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: TokenResponseDto,
    description: 'Refreshed authentication tokens.',
  })
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }
}
