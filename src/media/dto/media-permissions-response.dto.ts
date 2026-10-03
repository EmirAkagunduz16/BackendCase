import { ApiProperty } from '@nestjs/swagger';

export class MediaPermissionsResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ObjectId of the media record.',
  })
  mediaId: string;

  @ApiProperty({
    type: [String],
    example: ['507f1f77bcf86cd799439012'],
    description: 'MongoDB ObjectIds of users allowed to access the media.',
  })
  allowedUserIds: string[];
}
