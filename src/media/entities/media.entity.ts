import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity.js';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
  collection: 'media',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Media extends AbstractEntity {
  @Prop({
    ref: 'User',
    type: SchemaTypes.ObjectId,
    required: true,
    index: true,
  })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true, enum: ['image/jpeg'] })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'User' }], default: [] })
  allowedUserIds: Types.ObjectId[];

  createdAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

export type PublicMedia = Omit<Media, 'filePath'>;
