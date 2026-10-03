import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsByteLength, IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', format: 'email' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', format: 'password' })
  @IsString()
  @IsByteLength(1, 72)
  password: string;
}
