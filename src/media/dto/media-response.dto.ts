import { ApiProperty } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ObjectId of the media record.',
  })
  _id: string;

  @ApiProperty({
    example: '507f191e810c19729de860ea',
    description: 'MongoDB ObjectId of the media owner.',
  })
  ownerId: string;

  @ApiProperty({ example: 'b1f26734-7f42-4de1-9d68-7efff47448e9.jpg' })
  fileName: string;

  @ApiProperty({ enum: ['image/jpeg'], example: 'image/jpeg' })
  mimeType: 'image/jpeg';

  @ApiProperty({ example: 137, description: 'File size in bytes.' })
  size: number;

  @ApiProperty({
    type: [String],
    example: ['507f1f77bcf86cd799439012'],
    description: 'MongoDB ObjectIds of users allowed to access the media.',
  })
  allowedUserIds: string[];

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-10-03T12:00:00.000Z',
  })
  createdAt: string;
}
