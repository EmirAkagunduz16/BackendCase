import { IsIn, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMediaPermissionDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description:
      'MongoDB ObjectId of the user whose media permission will change.',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({ enum: ['add', 'remove'], example: 'add' })
  @IsIn(['add', 'remove'])
  action: 'add' | 'remove';
}
