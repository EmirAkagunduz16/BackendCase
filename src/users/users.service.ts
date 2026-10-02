import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import * as bcrypt from 'bcrypt';
import { mongo } from 'mongoose';
import { CreateUserInput } from './dto/create-user.dto.js';
import { User } from './entities/user.entity.js';
import { createHash } from 'node:crypto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string) {
    return this.usersRepository.findOneOrNull({ email });
  }

  async findOne(userId: string) {
    return this.toEntity(await this.usersRepository.findOne({ _id: userId }));
  }

  async verifyUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return this.toEntity(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    await this.usersRepository.findOneAndUpdate(
      { _id: userId },
      { $set: { refreshTokenHash } },
    );
  }

  private hashRefreshToken(refreshToken: string) {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  async create(createUserInput: CreateUserInput) {
    try {
      return this.toEntity(
        await this.usersRepository.create({
          email: createUserInput.email,
          passwordHash: await this.hashPassword(createUserInput.password),
        }),
      );
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        throw new ConflictException('Email already exists.');
      }
      throw error;
    }
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  toEntity(userDocument: User) {
    const {
      passwordHash: _passwordHash,
      refreshTokenHash: _refreshTokenHash,
      ...user
    } = userDocument;
    return user;
  }
}
