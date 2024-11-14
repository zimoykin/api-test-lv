import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAccess } from '../shared/guards/admin-access.decorator';
import { AdminUserUpdateDto } from './dtos/admin-user-update.dto';
import { plainToInstance } from 'class-transformer';
import { UserOutputDto } from './dtos/user-output.dto';

@ApiTags('admin')
@AdminAccess() // you have to be authenticated with admin role
@ApiBearerAuth('Authorization')
@Controller('api/v1/admin/users')
export class UsersAdminController {
  private readonly logger = new Logger(UsersAdminController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users',
  })
  @HttpCode(200)
  async findAll() {
    return this.usersService.findAll().then((users) => {
      return users.map((user) => {
        return plainToInstance(UserOutputDto, user);
      });
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user by id',
  })
  @HttpCode(200)
  async updateUser(@Param('id') id: string, @Body() dto: AdminUserUpdateDto) {
    this.logger.debug(`updating user ${id}`);
    return this.usersService.updateUserbyId(id, dto).then((user) => {
      return plainToInstance(UserOutputDto, user);
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user by id',
  })
  @HttpCode(200)
  async deleteUser(@Param('id') id: string) {
    this.logger.debug(`deleting user ${id}`);
    return this.usersService.deleteUserById(id).then((user) => {
      return plainToInstance(UserOutputDto, user);
    });
  }
}
