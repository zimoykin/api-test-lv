import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/shared/decorators/user.decorator';
import { IAuthUser } from 'src/shared/interfaces/authorized-user.interface';
import { UserUpdateDto } from './dtos/user-update.dto';
import { UserAccess } from 'src/shared/guards/user-access.decorator';
import { UserCreateDto } from './dtos/user-create.dto';
import { UserOutputDto } from './dtos/user-output.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('user')
@Controller('api/v1/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new user' })
  @Post('/register')
  async createNewUser(@Body() data: UserCreateDto): Promise<UserOutputDto> {
    return this.usersService
      .createUser(data)
      .then((user) => {
        return plainToInstance(UserOutputDto, user);
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  //USER can view their own details
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get user details by giving id from token' })
  @UserAccess() // you should be logged as a user
  @Get('me')
  @HttpCode(200)
  async getMe(@AuthUser() auth: IAuthUser): Promise<UserOutputDto> {
    return this.usersService
      .findById(auth.id)
      .then((user) => {
        return plainToInstance(UserOutputDto, user);
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  //USER can update their own details
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Update user details by giving id from token' })
  @UserAccess() // you should be logged as a user
  @HttpCode(200)
  @Put()
  async updateUser(
    @AuthUser() auth: IAuthUser,
    @Body() data: UserUpdateDto,
  ): Promise<UserOutputDto> {
    return this.usersService
      .updateUserbyId(auth.id, data)
      .then((user) => {
        return plainToInstance(UserOutputDto, user);
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }
}
