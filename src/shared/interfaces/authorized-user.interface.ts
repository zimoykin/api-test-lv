import { UserRole } from '../enums/user-role.enum';

export interface IAuthUser {
  id: string;
  role: UserRole;
  email: string;
}
