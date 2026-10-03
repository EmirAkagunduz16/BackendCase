import { ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../dto/login.dto.js';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ body: unknown }>();
    request.body = await new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }).transform(request.body, { type: 'body', metatype: LoginDto });
    return super.canActivate(context) as Promise<boolean>;
  }
}
