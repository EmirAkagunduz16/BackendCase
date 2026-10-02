import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import * as bcrypt from 'bcrypt';
import { mongo } from 'mongoose';
import { CreateUserInput } from './dto/create-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string) {
    return this.usersRepository.findOneOrNull({ email });
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
      if (
        error instanceof mongo.MongoServerError &&
        error.code === 11000
      ) {
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
