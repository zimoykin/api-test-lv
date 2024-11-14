import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

export class AdminUserUpdateDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsEnum(UserRole)
  role?: UserRole;
}
