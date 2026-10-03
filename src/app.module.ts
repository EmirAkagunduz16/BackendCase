import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { MediaModule } from './media/media.module.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module.js';
import Joi from 'joi';
import { AppController } from './app.controller.js';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MediaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        UPLOAD_DIR: Joi.string().required(),
        MAX_FILE_SIZE: Joi.number().integer().positive().required(),
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string()
          .min(32)
          .invalid(Joi.ref('JWT_ACCESS_SECRET'))
          .required(),
        JWT_ACCESS_TOKEN_EXPIRATION_MS: Joi.number()
          .integer()
          .positive()
          .required(),
        JWT_REFRESH_TOKEN_EXPIRATION_MS: Joi.number()
          .integer()
          .positive()
          .required(),
        PORT: Joi.number().integer().min(1).max(65535).required(),
      }),
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
