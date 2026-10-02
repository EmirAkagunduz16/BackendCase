import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity.js';

@Schema({ timestamps: true })
export class User extends AbstractEntity {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true,
  })
  role: 'user' | 'admin';

  @Prop({ type: String, default: null })
  refreshTokenHash: string | null;

  createdAt: Date;

  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type PublicUser = Omit<User, 'passwordHash' | 'refreshTokenHash'>;
