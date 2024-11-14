import { UseGuards } from '@nestjs/common';
import { UserGuard } from './user-jwt.guard';

export const UserAccess = () => {
  return UseGuards(UserGuard);
};
