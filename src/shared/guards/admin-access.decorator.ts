import { UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin-jwt.guard';
export const AdminAccess = () => {
  return UseGuards(AdminGuard);
};
