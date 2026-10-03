import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsByteLength,
  IsEmail,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', format: 'email' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    format: 'password',
    description:
      'At least 8 characters, including an uppercase letter, a lowercase letter, a number and a symbol. Maximum UTF-8 length: 72 bytes.',
  })
  @IsString()
  @IsStrongPassword()
  @IsByteLength(0, 72, {
    message: 'Parolanız çok uzun. Lütfen daha kısa bir parola kullanın.',
  })
  password: string;
}
