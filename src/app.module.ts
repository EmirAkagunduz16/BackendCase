import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { MediaModule } from './media/media.module.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module.js';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MediaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
