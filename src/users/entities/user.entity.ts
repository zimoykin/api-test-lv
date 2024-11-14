import { UserRole } from '../../shared/enums/user-role.enum';
import { generateHash, generateSalt } from '../../shared/security.helper';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  //this is not safe to keep password in db
  //but according to the task requirements...
  @Column()
  password: string;

  //will be better to store salt and hash separately, ideally in separate table(or db)
  @Column({
    type: 'text',
  })
  salt: string;

  @Column({ type: 'text' })
  hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    this.salt = generateSalt(256);
    this.hash = generateHash(this.password, this.salt, 32, 256);
  }

  checkPassword(password: string) {
    const candidate = generateHash(password, this.salt, 32, 256);
    return candidate === this.hash;
  }
}
