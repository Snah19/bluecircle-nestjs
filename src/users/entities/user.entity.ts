import { Exclude } from 'class-transformer';
import { Role } from '../../../prisma/generated/prisma/client';

export class UserEntity {
  id!: string;
  username!: string;
  fullname!: string;
  email!: string;
  role!: Role;
  profileImageUrl!: string;
  coverImageUrl!: string;
  bio!: string;
  link!: string;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  password!: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}