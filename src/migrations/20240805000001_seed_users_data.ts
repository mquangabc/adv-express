import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function up(knex: Knex): Promise<void> {
  // Tạo salt cho password hashing
  const salt = await bcrypt.genSalt(10);

  // Tạo các password đã hash
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);
  const testPassword = await bcrypt.hash('test123', salt);

  // Thêm dữ liệu test vào bảng users
  return knex('users').insert([
    {
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      first_name: 'Admin',
      last_name: 'User',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: userPassword,
      first_name: 'Regular',
      last_name: 'User',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: 'test',
      email: 'test@example.com',
      password: testPassword,
      first_name: 'Test',
      last_name: 'Account',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: 'inactive',
      email: 'inactive@example.com',
      password: await bcrypt.hash('inactive123', salt),
      first_name: 'Inactive',
      last_name: 'User',
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('johndoe123', salt),
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  // Xóa tất cả dữ liệu test
  return knex('users')
    .whereIn('email', [
      'admin@example.com',
      'user@example.com',
      'test@example.com',
      'inactive@example.com',
      'john.doe@example.com',
    ])
    .delete();
}
