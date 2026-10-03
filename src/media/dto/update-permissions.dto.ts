import { IsIn, IsMongoId } from 'class-validator';

export class UpdateMediaPermissionDto {
  @IsMongoId()
  userId: string;

  @IsIn(['add', 'remove'])
  action: 'add' | 'remove';
}
