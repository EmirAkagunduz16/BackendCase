import { Transform } from 'class-transformer';
import {
  IsByteLength,
  IsEmail,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  @IsByteLength(0, 72)
  password: string;
}
