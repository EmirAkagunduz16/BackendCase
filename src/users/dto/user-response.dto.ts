import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: '507f191e810c19729de860ea',
    description: 'MongoDB ObjectId of the user.',
  })
  _id: string;

  @ApiProperty({ example: 'user@example.com', format: 'email' })
  email: string;

  @ApiProperty({ enum: ['user', 'admin'], example: 'user' })
  role: 'user' | 'admin';

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-10-03T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-10-03T12:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({ example: 0, description: 'Mongoose document version.' })
  __v: number;
}
