import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { TokenPayload } from './token-payload.interface.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TokenPayload =>
    context.switchToHttp().getRequest<Request & { user: TokenPayload }>().user,
);
