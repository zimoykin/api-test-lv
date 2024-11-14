import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../shared/enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        UsersService,
        ConfigService,
        AuthService,
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('AuthService.login', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        UsersService,
        ConfigService,
        AuthService,
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should successfully login and return access and refresh tokens', async () => {
    const mockUser = {
      id: '1234-1234-1234-1234',
      email: 'test@test.com',
      name: 'Test User',
      password: 'password',
      salt: 'salt',
      role: UserRole.USER,
      hash: 'test',
      checkPassword: jest.fn().mockReturnValue(true),
      hashPassword: jest.fn(),
    };
    const mockSecret = 'test-secret';
    const mockToken = 'test-token';

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(configService, 'get').mockReturnValue(mockSecret);
    jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

    const result = await service.login({
      email: 'test@test.com',
      password: 'password',
    });

    expect(result).toEqual({
      access_token: mockToken,
      refresh_token: mockToken,
    });
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@test.com');
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(jwtService.sign).toHaveBeenCalledTimes(2);
  });

  it('should throw NotFoundException when user is not found', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

    await expect(
      service.login({ email: 'nonexistent@test.com', password: 'password' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when password is incorrect', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      password: 'password',
      email: 'test@test.com',
      salt: 'salt',
      role: UserRole.USER,
      hash: 'test',
      checkPassword: jest.fn().mockReturnValue(false),
      hashPassword: jest.fn(),
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

    await expect(
      service.login({ email: 'test@test.com', password: 'wrongpassword' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should generate different tokens for access and refresh', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      password: 'password',
      email: 'test@test.com',
      salt: 'salt',
      role: UserRole.USER,
      hash: 'test',
      checkPassword: jest.fn().mockReturnValue(true),
      hashPassword: jest.fn(),
    };
    const mockSecret = 'test-secret';

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(configService, 'get').mockReturnValue(mockSecret);
    jest.spyOn(jwtService, 'sign').mockImplementation((payload, options) => {
      return options?.expiresIn === '1d' ? 'access-token' : 'refresh-token';
    });

    const result = await service.login({
      email: 'test@test.com',
      password: 'password',
    });

    expect(result.access_token).toBe('access-token');
    expect(result.refresh_token).toBe('refresh-token');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: '1d' }),
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: '7d' }),
    );
  });
});
