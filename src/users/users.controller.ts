import { Controller } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserInput } from './dto/create-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async create(createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }
}
