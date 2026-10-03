import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token.',
    example: 'eyJhbGciOiJIUzI1NiJ9.example-access-payload.example-signature',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token.',
    example: 'eyJhbGciOiJIUzI1NiJ9.example-refresh-payload.example-signature',
  })
  refreshToken: string;
}
