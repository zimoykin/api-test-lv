import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from 'src/service-config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService<ConfigVariables>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Log in to the system.
   * @param data The login data with email and password.
   * @returns An object with access token and refresh token.
   * @throws NotFoundException if the user is not found or the password is wrong.
   */
  async login(data: LoginDto) {
    const secret = this.config.get('JWT_SECRET');
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException();
    }
    if (user.checkPassword(data.password)) {
      const access = this.jwtService.sign(
        { id: user.id, role: user.role, email: user.email },
        { secret, expiresIn: '1d' },
      );
      const refresh = this.jwtService.sign(
        { id: user.id, role: user.role, email: user.email },
        { secret, expiresIn: '7d' },
      );
      return { access_token: access, refresh_token: refresh };
    } else {
      this.logger.error('Wrong password');
      throw new NotFoundException();
    }
  }
}
