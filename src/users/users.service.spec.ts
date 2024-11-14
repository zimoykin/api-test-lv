import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRole } from '../shared/enums/user-role.enum';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: '1234-1234-1234-1234',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password',
    salt: 'salt',
    role: UserRole.USER,
    hash: 'test',
    checkPassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        UsersService,
        JwtService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user when email exists', async () => {
    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });

  it('should return null when email does not exist', async () => {
    jest.spyOn(service['usersRepository'], 'findOneBy').mockResolvedValue(null);

    const result = await service.findByEmail('nonexistent@example.com');
    expect(result).toBeNull();
    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      email: 'nonexistent@example.com',
    });
  });

  it('should handle repository errors', async () => {
    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockRejectedValue(new Error('Database error'));

    await expect(service.findByEmail('test@example.com')).rejects.toThrow(
      'Database error',
    );
  });
  it('should return a user when id exists', async () => {
    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockResolvedValue(mockUser);

    const result = await service.findById('1234-1234-1234-1234');
    expect(result).toEqual(mockUser);
    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: '1234-1234-1234-1234',
    });
  });

  it('should return null when id does not exist', async () => {
    jest.spyOn(service['usersRepository'], 'findOneBy').mockResolvedValue(null);

    const result = await service.findById('nonexistent-id');
    expect(result).toBeNull();
    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: 'nonexistent-id',
    });
  });

  it('should handle repository errors when finding by id', async () => {
    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockRejectedValue(new Error('Database error'));

    await expect(service.findById('1234-1234-1234-1234')).rejects.toThrow(
      'Database error',
    );
  });

  it('should handle invalid id format', async () => {
    jest.spyOn(service['usersRepository'], 'findOneBy').mockResolvedValue(null);

    const result = await service.findById('invalid-uuid-format');
    expect(result).toBeNull();
    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: 'invalid-uuid-format',
    });
  });

  it('should successfully delete an existing user', async () => {
    const mockUserToDelete = { ...mockUser };
    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockResolvedValue(mockUserToDelete);
    jest
      .spyOn(service['usersRepository'], 'remove')
      .mockResolvedValue(mockUserToDelete);

    const result = await service.deleteUserById('1234-1234-1234-1234');

    expect(result).toEqual(mockUserToDelete);
    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: '1234-1234-1234-1234',
    });
    expect(service['usersRepository'].remove).toHaveBeenCalledWith(
      mockUserToDelete,
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    jest.spyOn(service['usersRepository'], 'findOneBy').mockResolvedValue(null);
    jest
      .spyOn(service['usersRepository'], 'remove')
      .mockResolvedValue(mockUser);

    await expect(service.deleteUserById('nonexistent-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: 'nonexistent-id',
    });
    expect(service['usersRepository'].remove).not.toHaveBeenCalled();
  });

  it('should handle database error during deletion', async () => {
    const mockUserToDelete = { ...mockUser };
    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockResolvedValue(mockUserToDelete);
    jest
      .spyOn(service['usersRepository'], 'remove')
      .mockRejectedValue(new Error('Database error'));

    await expect(service.deleteUserById('1234-1234-1234-1234')).rejects.toThrow(
      'Database error',
    );

    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: '1234-1234-1234-1234',
    });
    expect(service['usersRepository'].remove).toHaveBeenCalledWith(
      mockUserToDelete,
    );
  });

  it('should successfully update an existing user', async () => {
    const mockUserToUpdate = { ...mockUser };
    const updateData = { name: 'Updated Name', email: 'updated@example.com' };

    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockResolvedValue(mockUserToUpdate);
    jest
      .spyOn(service['usersRepository'], 'create')
      .mockReturnValue({ ...mockUserToUpdate, ...updateData });
    jest
      .spyOn(service['usersRepository'], 'save')
      .mockResolvedValue({ ...mockUserToUpdate, ...updateData });

    const result = await service.updateUserbyId(
      '1234-1234-1234-1234',
      updateData,
    );

    expect(result).toEqual({ ...mockUserToUpdate, ...updateData });
    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: '1234-1234-1234-1234',
    });
    expect(service['usersRepository'].create).toHaveBeenCalledWith({
      ...mockUserToUpdate,
      ...updateData,
    });
    expect(service['usersRepository'].save).toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating non-existent user', async () => {
    const updateData = { name: 'Updated Name' };
    jest.spyOn(service['usersRepository'], 'findOneBy').mockResolvedValue(null);
    jest.spyOn(service['usersRepository'], 'create').mockReturnValue(mockUser);
    jest.spyOn(service['usersRepository'], 'save').mockResolvedValue(mockUser);

    await expect(
      service.updateUserbyId('nonexistent-id', updateData),
    ).rejects.toThrow(NotFoundException);

    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: 'nonexistent-id',
    });
    expect(service['usersRepository'].create).not.toHaveBeenCalled();
    expect(service['usersRepository'].save).not.toHaveBeenCalled();
  });

  it('should handle database error during update', async () => {
    const mockUserToUpdate = { ...mockUser };
    const updateData = { name: 'Updated Name' };

    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockResolvedValue(mockUserToUpdate);
    jest
      .spyOn(service['usersRepository'], 'create')
      .mockReturnValue({ ...mockUserToUpdate, ...updateData });
    jest
      .spyOn(service['usersRepository'], 'save')
      .mockRejectedValue(new Error('Database error'));

    await expect(
      service.updateUserbyId('1234-1234-1234-1234', updateData),
    ).rejects.toThrow('Database error');

    expect(service['usersRepository'].findOneBy).toHaveBeenCalledWith({
      id: '1234-1234-1234-1234',
    });
    expect(service['usersRepository'].create).toHaveBeenCalled();
    expect(service['usersRepository'].save).toHaveBeenCalled();
  });

  it('should update only provided fields and keep others unchanged', async () => {
    const mockUserToUpdate = { ...mockUser };
    const partialUpdate = { name: 'Updated Name' };

    jest
      .spyOn(service['usersRepository'], 'findOneBy')
      .mockResolvedValue(mockUserToUpdate);
    jest
      .spyOn(service['usersRepository'], 'create')
      .mockReturnValue({ ...mockUserToUpdate, ...partialUpdate });
    jest
      .spyOn(service['usersRepository'], 'save')
      .mockResolvedValue({ ...mockUserToUpdate, ...partialUpdate });

    const result = await service.updateUserbyId(
      '1234-1234-1234-1234',
      partialUpdate,
    );

    expect(result.name).toBe('Updated Name');
    expect(result.email).toBe(mockUser.email);
    expect(result.role).toBe(mockUser.role);
  });
});
