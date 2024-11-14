import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Find a user by email.
   * @param email The email to search for.
   * @returns The user if found, or null if not found.
   */
  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  /**
   * Find a user by id.
   * @param id The id to search for.
   * @returns The user if found, or null if not found.
   */
  async findById(id: string) {
    return this.usersRepository.findOneBy({ id });
  }

  /**
   * Find all users.
   * @returns A list of all users.
   */
  async findAll() {
    return this.usersRepository.find();
  }

  /**
   * Creates a new user in the database.
   * @param user The user data to add.
   * @returns The user that was created.
   */
  async createUser(user: Partial<UserEntity>) {
    return this.usersRepository.save(this.usersRepository.create(user));
  }

  /**
   * Updates a user's information by their ID.
   * @param id The ID of the user to update.
   * @param user The partial data to update on the user.
   * @returns The updated user entity.
   * @throws NotFoundException if the user is not found.
   */
  async updateUserbyId(id: string, user: Partial<UserEntity>) {
    const userToUpdate = await this.findById(id);
    if (!userToUpdate) {
      this.logger.error('User not found');
      throw new NotFoundException();
    }
    return this.usersRepository.save(
      this.usersRepository.create({ ...userToUpdate, ...user }),
    );
  }

  /**
   * Delete by id.
   * @param id The ID of the user to update.
   * @returns The deleted user entity.
   * @throws NotFoundException if the user is not found.
   */
  async deleteUserById(id: string) {
    const userToDelete = await this.findById(id);
    if (!userToDelete) {
      this.logger.error('User not found');
      throw new NotFoundException();
    }
    await this.usersRepository.remove(userToDelete);
    return userToDelete;
  }
}
