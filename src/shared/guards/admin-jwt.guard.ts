import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfigVariables } from '../../service-config';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<ConfigVariables>,
  ) {}
  getRequest(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req = http.getRequest();
    return req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    if (!req.headers.authorization) return false;
    else {
      try {
        const { id, role, email } = await this.validate(
          req.headers.authorization,
        );
        if (id && role && email) {
          if (role === UserRole.ADMIN) {
            req.auth = { id, role, email };
          }
        }
        return req.auth !== undefined;
      } catch (error) {
        this.logger.error(error);
        throw new ForbiddenException('wrong access token');
      }
    }
  }

  async validate(token: string): Promise<Record<string, string>> {
    const tokenKey = token.split(' ');
    if (tokenKey.length === 2 && tokenKey[0] === 'Bearer' && tokenKey[1]) {
      const secret = this.config.get('JWT_SECRET');
      const result = await this.jwt.verify(tokenKey[1], { secret });
      if (result) {
        return result;
      } else throw new UnauthorizedException();
    } else throw new UnauthorizedException();
  }
}
