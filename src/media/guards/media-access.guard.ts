import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MediaService } from '../media.service.js';
import type { MediaRequest } from '../media-request.interface.js';

@Injectable()
export class MediaAccessGuard implements CanActivate {
  constructor(private readonly mediaService: MediaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MediaRequest>();
    const { id } = request.params;
    if (
      typeof id !== 'string' ||
      id.length !== 24 ||
      !/^[0-9a-f]{24}$/i.test(id)
    ) {
      throw new BadRequestException('Invalid media ID.');
    }

    const media = await this.mediaService.findOne(new Types.ObjectId(id));
    const userId = request.user._id;
    const isOwner = media.ownerId.equals(userId);
    const isAllowed = media.allowedUserIds.some((id) => id.equals(userId));
    if (!isOwner && !isAllowed) {
      throw new ForbiddenException('You do not have access to this media.');
    }

    request.media = media;
    return true;
  }
}
