import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token.',
    example: 'eyJhbGciOiJIUzI1NiJ9.example-access-payload.example-signature',
  })
  accessToken: string;
}
