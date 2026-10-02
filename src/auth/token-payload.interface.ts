import type { User } from '../users/entities/user.entity.js';

export interface TokenPayload {
  _id: string;
  role: User['role'];
}
