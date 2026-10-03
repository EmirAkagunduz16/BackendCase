import type { Request } from 'express';
import type { PublicUser } from '../users/entities/user.entity.js';
import type { Media } from './entities/media.entity.js';

export interface MediaRequest extends Request {
  user: PublicUser;
  media: Media;
}
