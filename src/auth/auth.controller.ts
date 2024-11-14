import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { AccessDto } from './dtos/access.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('api/v1/auth')
@ApiTags('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user by email and password' })
  async login(@Body() data: LoginDto): Promise<AccessDto> {
    this.logger.debug(`login requested by ${data.email}`);
    return this.authService.login(data);
  }
}
