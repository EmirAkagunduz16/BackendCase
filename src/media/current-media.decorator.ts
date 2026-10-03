import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Media } from './entities/media.entity.js';
import type { MediaRequest } from './media-request.interface.js';

export const CurrentMedia = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Media =>
    context.switchToHttp().getRequest<MediaRequest>().media,
);
