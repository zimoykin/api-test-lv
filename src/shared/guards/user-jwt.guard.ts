import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { BaseJwtGuard } from './jwt-base.guard';

@Injectable()
export class UserGuard extends BaseJwtGuard implements CanActivate {
  private readonly logger = new Logger(UserGuard.name);
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
          req.auth = { id, role, email };
        }
        return req.auth !== undefined;
      } catch (error) {
        this.logger.error(error);
        throw new ForbiddenException('wrong access token');
      }
    }
  }
}
