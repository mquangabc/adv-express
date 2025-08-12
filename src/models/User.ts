import db from '../config/database';
import bcrypt from 'bcryptjs';
import { User, UserCreateInput, UserUpdateInput } from '../types';

export class UserModel {
  static async create(userData: UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const [user] = await db('users')
      .insert({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        avatar: userData.avatar,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapDbUserToUser(user);
  }

  static async findById(id: number): Promise<User | null> {
    const user = await db('users').where({ id, is_active: true }).first();
    return user ? this.mapDbUserToUser(user) : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await db('users').where({ email, is_active: true }).first();
    return user ? this.mapDbUserToUser(user) : null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const user = await db('users').where({ username, is_active: true }).first();
    return user ? this.mapDbUserToUser(user) : null;
  }

  static async update(
    id: number,
    updateData: UserUpdateInput
  ): Promise<User | null> {
    await db('users')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date(),
      });

    const user = await db('users').where({ id }).first();

    return user ? this.mapDbUserToUser(user) : null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db('users')
      .where({ id })
      .update({ deleted: true, updated_at: new Date() });

    return result > 0;
  }

  static async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const [users, totalResult] = await Promise.all([
      db('users')
        .where({ deleted: false })
        .limit(limit)
        .offset(offset)
        .orderBy('created_at', 'desc'),
      db('users').where({ deleted: true }).count('* as count').first(),
    ]);

    return {
      users: users.map(this.mapDbUserToUser),
      total: parseInt((totalResult?.count as string) || '0'),
    };
  }

  static async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      password: dbUser.password,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      avatar: dbUser.avatar,
      isActive: dbUser.is_active,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }

  static toSafeUser(user: User): Omit<User, 'password'> {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
