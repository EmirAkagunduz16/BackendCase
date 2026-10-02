import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from '../../common/database/abstract.entity.js';

@Schema()
export class User extends AbstractEntity {
  @Prop()
  email: string;

  @Prop()
  passwordHash: string;

  @Prop()
  role: 'user' | 'admin';

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
