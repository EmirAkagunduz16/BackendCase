import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import * as bcrypt from 'bcrypt';
import { mongo, type QueryFilter, type UpdateQuery } from 'mongoose';
import { CreateUserInput } from './dto/create-user.dto.js';
import { User, type PublicUser } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

  async getUser(query: QueryFilter<User>) {
    return this.usersRepository.findOne(query);
  }

  async updateUser(query: QueryFilter<User>, data: UpdateQuery<User>) {
    return this.usersRepository.findOneAndUpdate(query, data);
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  toEntity(userDocument: User): PublicUser {
    const {
      passwordHash: _passwordHash,
      refreshTokenHash: _refreshTokenHash,
      ...user
    } = userDocument;
    return user;
  }
}
